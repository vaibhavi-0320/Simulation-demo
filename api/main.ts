import { VercelRequest, VercelResponse } from "@vercel/node";
import * as StellarSdk from "@stellar/stellar-sdk";
import {
  errorResponse,
  getBackendModules,
  isValidStellarPublicKey,
  jsonResponse,
  sanitizeAmount,
  withErrorHandling,
} from "./_lib/handlers";

const HORIZON = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
const PASSPHRASE = StellarSdk.Networks.TESTNET;
const ESCROW =
  process.env.ESCROW_DESTINATION?.trim() ||
  "GBUWCRHTSXJ5WCERNSIKUFVTZ35M542OID4FRZI2TFNKEVVHSPY7PT5Z";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getAction(req: VercelRequest) {
  return firstValue(req.query.action) || req.body?.action;
}

function getInput(req: VercelRequest, key: string) {
  return firstValue(req.query[key] as string | string[] | undefined) ?? req.body?.[key];
}

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  const action = getAction(req);

  if (!action || typeof action !== "string") {
    return errorResponse(res, "Missing action", 400);
  }

  const { logger, service, validation } = await getBackendModules();

  if (action === "health") {
    if (req.method !== "GET") {
      return errorResponse(res, "Method not allowed", 405);
    }

    return jsonResponse(res, {
      success: true,
      data: { status: "ok", service: "fintrix-api" },
    });
  }

  if (action === "transactions") {
    if (req.method !== "GET") {
      return errorResponse(res, "Method not allowed", 405);
    }

    try {
      const result = await service.listTransactions();
      return jsonResponse(res, { success: true, data: result });
    } catch (error: any) {
      return errorResponse(res, error?.message || "Failed to list transactions", 500);
    }
  }

  if (action === "visitors") {
    if (req.method !== "GET") {
      return errorResponse(res, "Method not allowed", 405);
    }

    try {
      const result = await service.listVisitors();
      return jsonResponse(res, { success: true, data: result });
    } catch (error: any) {
      return errorResponse(res, error?.message || "Failed to list visitors", 500);
    }
  }

  if (action === "track-visitor") {
    if (req.method !== "POST") {
      return errorResponse(res, "Method not allowed", 405);
    }

    try {
      const body = validation.visitorSchema.parse({
        ...req.body,
        userAgent: req.body?.userAgent || req.headers["user-agent"],
        language: req.body?.language || req.headers["accept-language"],
      });
      const visitor = await service.trackVisitor(body);
      return jsonResponse(res, { success: true, data: visitor }, 201);
    } catch (error: any) {
      return errorResponse(res, error?.message || "Failed to track visitor", 400);
    }
  }

  if (action === "invoices" || action === "invoice-all" || action === "invoice-list") {
    if (req.method === "GET") {
      try {
        const result = await service.listInvoices();
        return jsonResponse(res, { success: true, data: result });
      } catch (error: any) {
        return errorResponse(res, error?.message || "Failed to list invoices", 500);
      }
    }

    if (req.method === "POST") {
      try {
        const body = validation.invoiceCreateSchema.parse(req.body) as Parameters<
          typeof service.createInvoice
        >[0];
        const result = await service.createInvoice(body);
        return jsonResponse(res, { success: true, data: result }, 201);
      } catch (error: any) {
        return errorResponse(res, error?.message || "Failed to create invoice", 400);
      }
    }

    return errorResponse(res, "Method not allowed", 405);
  }

  if (action === "invoice-upload") {
    if (req.method !== "POST") {
      return errorResponse(res, "Method not allowed", 405);
    }

    try {
      const body = validation.invoiceCreateSchema.parse(req.body);
      const preview = {
        id: body.number || `INV-${Date.now()}`,
        buyer: body.buyer,
        amount: body.amount,
        discount: body.discount,
        due: body.due,
        seller: body.seller,
        notes: body.notes || "Invoice ready for listing.",
      };
      logger.info({ invoiceId: preview.id, buyer: preview.buyer }, "invoice upload accepted");
      return jsonResponse(res, { success: true, data: preview }, 201);
    } catch (error: any) {
      return errorResponse(res, error?.message || "Failed to upload invoice", 400);
    }
  }

  if (action === "invoice-action") {
    if (req.method !== "POST") {
      return errorResponse(res, "Method not allowed", 405);
    }

    try {
      const invoiceAction = getInput(req, "invoiceAction") || getInput(req, "subaction");
      const id = getInput(req, "id") || req.body?.invoiceId;

      if (invoiceAction === "repay" && typeof id === "string" && id.length > 0) {
        validation.emptyBodySchema.parse(req.body || {});
        const result = await service.repayInvoice(id);
        return jsonResponse(res, { success: true, data: result });
      }

      return errorResponse(res, "Unknown action.", 400);
    } catch (error: any) {
      return errorResponse(res, error?.message || "Failed to perform invoice action", 400);
    }
  }

  if (action === "portfolio") {
    if (req.method !== "GET") {
      return errorResponse(res, "Method not allowed", 405);
    }

    const walletAddress = getInput(req, "walletAddress");
    if (!walletAddress || typeof walletAddress !== "string") {
      return errorResponse(res, "Missing or invalid walletAddress", 400);
    }

    if (!isValidStellarPublicKey(walletAddress)) {
      return errorResponse(res, "Invalid Stellar public key format.", 400);
    }

    try {
      const result = await service.listInvoices();
      const invoices = result.filter((inv) => inv.funder === walletAddress);
      const totalInvested = invoices.reduce((sum, inv) => sum + ((inv as any).amount || 0), 0);
      const activeInvoices = invoices.filter((inv) => inv.status === "funded").length;
      const averageAPY =
        invoices.length > 0
          ? invoices.reduce((sum, inv) => sum + ((inv as any).yield || 8.2), 0) / invoices.length
          : 0;

      return jsonResponse(res, { totalInvested, activeInvoices, averageAPY });
    } catch (error: any) {
      return errorResponse(res, error?.message || "Failed to get portfolio", 500);
    }
  }

  if (action === "ai-parse") {
    if (req.method !== "POST") {
      return errorResponse(res, "Method not allowed", 405);
    }

    try {
      const body = validation.parseInvoiceSchema.parse(req.body);
      const data = await service.parseInvoice(body.fileBase64, body.mimeType);
      return jsonResponse(res, { success: true, data });
    } catch (error: any) {
      return errorResponse(res, error?.message || "Failed to parse invoice", 400);
    }
  }

  if (action === "chat") {
    if (req.method !== "POST") {
      return errorResponse(res, "Method not allowed", 405);
    }

    try {
      const body = validation.chatSchema.parse(req.body) as Parameters<typeof service.askAssistant>[0];
      const data = await service.askAssistant(body);
      return jsonResponse(res, { success: true, data });
    } catch (error: any) {
      return errorResponse(res, error?.message || "Failed to get chat response", 400);
    }
  }

  if (action === "auth-challenge") {
    if (req.method !== "POST") {
      return errorResponse(res, "Method not allowed", 405);
    }

    try {
      const body = validation.addressSchema.parse(req.body);
      const walletAuth = await import("../backend/wallet-auth.ts");
      const result = await walletAuth.createChallenge(body.address);
      return jsonResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error?.message || "Invalid request", 400);
    }
  }

  if (action === "auth-verify") {
    if (req.method !== "POST") {
      return errorResponse(res, "Method not allowed", 405);
    }

    try {
      const body = validation.signatureSchema.parse(req.body);
      const walletAuth = await import("../backend/wallet-auth.ts");
      const result = await walletAuth.verifySignature(body.address, body.signature, body.nonce);
      return jsonResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error?.message || "Invalid request", 400);
    }
  }

  if (action === "stellar-health") {
    if (req.method !== "GET") {
      return errorResponse(res, "Method not allowed", 405);
    }

    try {
      const acc = await HORIZON.loadAccount(ESCROW);
      const xlm = acc.balances.find((b: any) => b.asset_type === "native");
      return jsonResponse(res, {
        ok: true,
        escrow: ESCROW,
        balance: xlm?.balance,
      });
    } catch (error: any) {
      return res.status(500).json({
        ok: false,
        error: error.message,
        escrow: ESCROW,
      });
    }
  }

  if (action === "stellar-build") {
    if (req.method !== "POST") {
      return errorResponse(res, "Method not allowed", 405);
    }

    const { investorPublicKey, amountUSD, invoiceId } = req.body;
    const safeAmount = sanitizeAmount(amountUSD);

    if (!isValidStellarPublicKey(investorPublicKey)) {
      return errorResponse(res, "Invalid Stellar public key format.", 400);
    }
    if (!safeAmount) {
      return errorResponse(res, "Invalid amount. Must be between $1 and $1,000,000.", 400);
    }
    if (!invoiceId) {
      return errorResponse(res, "Missing invoiceId", 400);
    }

    let account: any;
    try {
      account = await HORIZON.loadAccount(investorPublicKey);
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 404) {
        return errorResponse(
          res,
          `Your wallet is not activated on Stellar testnet. Visit https://laboratory.stellar.org/#account-creator?network=test and fund: ${investorPublicKey}`,
          400
        );
      }
      return errorResponse(res, `Horizon loadAccount failed: ${error.message}`, 400);
    }

    const xlmBal = account.balances.find((b: any) => b.asset_type === "native");
    const xlmNeeded = safeAmount / 0.11 + 2;
    if (!xlmBal || parseFloat(xlmBal.balance) < xlmNeeded) {
      return errorResponse(
        res,
        `Insufficient XLM. Need ${xlmNeeded.toFixed(2)} XLM, have ${xlmBal?.balance || 0} XLM. Fund at Friendbot.`,
        400
      );
    }

    try {
      await HORIZON.loadAccount(ESCROW);
    } catch {
      return errorResponse(
        res,
        `Escrow account not on testnet: ${ESCROW}. Fund it at Friendbot first.`,
        400
      );
    }

    const xlmAmount = (safeAmount / 0.11).toFixed(7);
    const memo = `INV:${String(invoiceId).substring(0, 22)}`;

    try {
      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: PASSPHRASE,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: ESCROW,
            asset: StellarSdk.Asset.native(),
            amount: xlmAmount,
          })
        )
        .addMemo(StellarSdk.Memo.text(memo))
        .setTimeout(30)
        .build();

      const xdr = tx.toXDR();
      return jsonResponse(res, { xdr, xlmAmount, destination: ESCROW });
    } catch (error: any) {
      console.error("[BUILD] TransactionBuilder error:", error);
      return errorResponse(res, `Failed to build XDR: ${error.message}`, 500);
    }
  }

  if (action === "stellar-submit") {
    if (req.method !== "POST") {
      return errorResponse(res, "Method not allowed", 405);
    }

    const { signedXdr, amountUSD } = req.body;

    if (!signedXdr) {
      return errorResponse(res, "Missing signedXdr", 400);
    }
    if (amountUSD !== undefined && amountUSD !== null && !sanitizeAmount(amountUSD)) {
      return errorResponse(res, "Invalid amount. Must be between $1 and $1,000,000.", 400);
    }

    let txResult: any;
    try {
      const tx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, PASSPHRASE);
      txResult = await HORIZON.submitTransaction(tx);
    } catch (error: any) {
      const codes = error?.response?.data?.extras?.result_codes;
      const detail = error?.response?.data?.extras?.result_xdr;
      console.error("[SUBMIT] Horizon error:", JSON.stringify(codes), detail);
      return errorResponse(
        res,
        codes ? `Stellar rejected: ${JSON.stringify(codes)}` : `Submit failed: ${error.message}`,
        400
      );
    }

    return jsonResponse(res, {
      success: true,
      txHash: txResult.hash,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txResult.hash}`,
    });
  }

  if (action === "stellar-build-simulation") {
    if (req.method !== "POST") {
      return errorResponse(res, "Method not allowed", 405);
    }

    try {
      const body = typeof (req as any).json === 'function' ? await (req as any).json() : (typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}));
      const { investorPublicKey, amountUSD, invoiceId, dealId } = body;
      const safeAmount = sanitizeAmount(amountUSD);

      if (!isValidStellarPublicKey(investorPublicKey)) {
        return errorResponse(res, "Invalid Stellar public key format.", 400);
      }
      if (!safeAmount) {
        return errorResponse(res, "Invalid amount. Must be between $1 and $1,000,000.", 400);
      }

      let account: any;
      try {
        account = await HORIZON.loadAccount(investorPublicKey);
      } catch (error: any) {
        if (error?.response?.status === 404) {
          return errorResponse(
            res,
            "Wallet not activated on testnet. Fund at: https://laboratory.stellar.org/#account-creator?network=test",
            400
          );
        }
        return errorResponse(res, `Account load failed: ${error.message}`, 400);
      }

      const xlmBal = account.balances.find((b: any) => b.asset_type === "native");
      if (!xlmBal || parseFloat(xlmBal.balance) < 2) {
        return errorResponse(
          res,
          `Need at least 2 XLM for simulation. Current: ${xlmBal?.balance || 0} XLM`,
          400
        );
      }

      const memoText = `SIM:${String(dealId || invoiceId).substring(0, 20)}`;

      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: PASSPHRASE,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: investorPublicKey,
            asset: StellarSdk.Asset.native(),
            amount: "1.0000000",
          })
        )
        .addMemo(StellarSdk.Memo.text(memoText))
        .setTimeout(30)
        .build();

      const xdr = tx.toXDR();
      
      // Ensure successful JSON response
      return res.status(200).json({
        success: true,
        data: { xdr, memo: memoText }
      });

    } catch (error: any) {
      console.error("Simulation API Error:", error);
      return res.status(500).json({
        success: false,
        error: "Simulation failed",
        details: String(error)
      });
    }
  }

  return errorResponse(res, `Unknown action: ${action}`, 400);
});
