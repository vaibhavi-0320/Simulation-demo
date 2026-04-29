import { jsonError, listInvoices, listTransactions, listVisitors, createInvoice, parseInvoice, repayInvoice, askAssistant, trackVisitor, buildFundInvoiceTransaction } from "../../backend/service";
import * as StellarSdk from "stellar-sdk";

const HORIZON = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
const PASSPHRASE = StellarSdk.Networks.TESTNET;

function isValidStellarPublicKey(key: string) {
  return typeof key === "string" && StellarSdk.StrKey.isValidEd25519PublicKey(key);
}

function mapSubmitError(error: any) {
  const codes = error?.response?.data?.extras?.result_codes;
  const txCode = codes?.transaction;
  const opCode = Array.isArray(codes?.operations) ? codes.operations[0] : undefined;

  if (txCode === "tx_bad_seq") {
    return "Sequence mismatch on Stellar. Refresh and try again.";
  }
  if (opCode === "op_underfunded" || txCode === "tx_insufficient_balance") {
    return "Insufficient XLM to complete this transaction.";
  }
  if (opCode === "op_no_destination") {
    return "Destination wallet not activated on Stellar testnet.";
  }
  if (error?.message?.toLowerCase().includes("timeout")) {
    return "Stellar network timeout. Please retry the transaction.";
  }

  return error?.response?.data?.detail || error?.message || "Unable to submit Stellar transaction.";
}

export default async function handler(req: any, res: any) {
  const action = String(req.query?.action || "");

  // health
  if (action === "health") {
    res.status(200).json({ status: "ok", service: "stellar99-api" });
    return;
  }

  // health for stellar
  if (action === "stellar-health") {
    res.status(200).json({ status: "ok", service: "stellar99-api" });
    return;
  }

  // chat
  if (action === "chat") {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed." });
      return;
    }
    try {
      res.status(200).json(await askAssistant({
        question: String(req.body?.question || ""),
        walletAddress: req.body?.walletAddress,
        view: req.body?.view,
        history: Array.isArray(req.body?.history) ? req.body.history : [],
      }));
    } catch (error) {
      res.status(500).json(jsonError(error));
    }
    return;
  }

  // ai-parse
  if (action === "ai-parse") {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed." });
      return;
    }
    try {
      res.status(200).json(await parseInvoice(req.body?.fileBase64 || "", req.body?.mimeType || "application/octet-stream"));
    } catch (error) {
      res.status(500).json(jsonError(error));
    }
    return;
  }

  // invoices (GET/POST)
  if (action === "invoices") {
    if (req.method === "GET") {
      res.status(200).json(listInvoices());
      return;
    }
    if (req.method === "POST") {
      try {
        res.status(201).json(createInvoice(req.body));
      } catch (error) {
        res.status(400).json(jsonError(error));
      }
      return;
    }
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  // invoice-all
  if (action === "invoice-all") {
    try {
      res.status(200).json(listInvoices());
    } catch (error) {
      res.status(500).json(jsonError(error));
    }
    return;
  }

  // invoice-list
  if (action === "invoice-list") {
    if (req.method === "POST") {
      try {
        const result = createInvoice(req.body);
        res.status(201).json(result);
      } catch (error) {
        res.status(400).json(jsonError(error));
      }
    } else {
      res.status(200).json(listInvoices());
    }
    return;
  }

  // invoice-upload
  if (action === "invoice-upload") {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed." });
      return;
    }
    try {
      res.status(201).json(createInvoice(req.body));
    } catch (error) {
      res.status(400).json(jsonError(error));
    }
    return;
  }

  // transactions
  if (action === "transactions") {
    res.status(200).json(listTransactions());
    return;
  }

  // visitors
  if (action === "visitors") {
    res.status(200).json(listVisitors());
    return;
  }

  // invoice-action
  if (action === "invoice-action") {
    const id = String(req.query?.id || "");

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed." });
      return;
    }

    try {
      if (req.query?.action === "repay" || req.body?.action === "repay") {
        res.status(200).json(repayInvoice(id));
        return;
      }
      res.status(400).json({ error: "Unknown action." });
    } catch (error) {
      res.status(400).json(jsonError(error));
    }
    return;
  }

  // track-visitor
  if (action === "track-visitor") {
    if (req.method === "POST") {
      try {
        const visitor = trackVisitor({
          id: String(req.body?.id || ""),
          userAgent: String(req.body?.userAgent || req.headers["user-agent"] || ""),
          language: String(req.body?.language || req.headers["accept-language"] || ""),
          platform: String(req.body?.platform || ""),
        });
        res.status(201).json(visitor);
      } catch (error) {
        res.status(400).json(jsonError(error));
      }
      return;
    }
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  // portfolio
  if (action === "portfolio") {
    const walletAddress = String(req.query?.walletAddress || "");
    if (!isValidStellarPublicKey(walletAddress)) {
      res.status(400).json({ error: "Invalid Stellar public key format." });
      return;
    }
    try {
      const result = listInvoices();
      const invoices = result.filter((inv: any) => inv.funder === walletAddress);
      const totalInvested = invoices.reduce((sum, inv) => sum + ((inv as any).amount || 0), 0);
      const activeInvoices = invoices.filter((inv: any) => inv.status === 'funded').length;
      const averageAPY = invoices.length > 0 
        ? invoices.reduce((sum, inv) => sum + ((inv as any).yield || 8.2), 0) / invoices.length 
        : 0;
      res.json({ totalInvested, activeInvoices, averageAPY });
    } catch (error) {
      res.status(500).json(jsonError(error));
    }
    return;
  }

  // stellar-build
  if (action === "stellar-build") {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed." });
      return;
    }
    try {
      const result = await buildFundInvoiceTransaction({
        invoiceId: String(req.body?.invoiceId || req.body?.dealId || ""),
        dealId: req.body?.dealId ? String(req.body.dealId) : undefined,
        investorWalletAddress: String(req.body?.investorPublicKey || req.body?.investorWalletAddress || ""),
        amountUSD: Number(req.body?.amountUSD || 0),
        destinationWallet: req.body?.destinationWallet ? String(req.body.destinationWallet) : undefined,
      });
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json(jsonError(error));
    }
    return;
  }

  // stellar-submit
  if (action === "stellar-submit") {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed." });
      return;
    }
    try {
      const signedXdr = String(req.body?.signedXdr || "");
      if (!signedXdr) {
        res.status(400).json({ error: "Missing signedXdr" });
        return;
      }

      const transaction = StellarSdk.TransactionBuilder.fromXDR(signedXdr, PASSPHRASE);
      const result = await HORIZON.submitTransaction(transaction);

      res.status(200).json({
        success: true,
        txHash: result.hash,
        explorerUrl: `https://stellar.expert/explorer/testnet/tx/${result.hash}`,
      });
    } catch (error: any) {
      res.status(400).json({ error: mapSubmitError(error), details: jsonError(error) });
    }
    return;
  }

  // stellar-build-simulation
  if (action === "stellar-build-simulation") {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed." });
      return;
    }
    try {
      const investorPublicKey = String(req.body?.investorPublicKey || "");
      const amountUSD = Number(req.body?.amountUSD || 0);
      const invoiceId = String(req.body?.invoiceId || req.body?.dealId || "");

      if (!isValidStellarPublicKey(investorPublicKey)) {
        res.status(400).json({ error: "Invalid Stellar public key format." });
        return;
      }
      if (!Number.isFinite(amountUSD) || amountUSD <= 0) {
        res.status(400).json({ error: "Invalid amount. Must be greater than zero." });
        return;
      }

      const account = await HORIZON.loadAccount(investorPublicKey).catch(() => null);
      if (!account) {
        res.status(400).json({
          error: `Wallet not activated on Stellar testnet. Fund it first: https://friendbot.stellar.org?addr=${investorPublicKey}`,
        });
        return;
      }

      const nativeBalance = Number(
        account.balances.find((balance: any) => balance.asset_type === "native")?.balance || 0
      );
      if (nativeBalance < 2) {
        res.status(400).json({ error: `Need at least 2 XLM for simulation. Current balance: ${nativeBalance} XLM.` });
        return;
      }

      const memoText = `SIM:${invoiceId}`.slice(0, 28);
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: String(await HORIZON.fetchBaseFee()),
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

      res.status(200).json({ xdr: transaction.toXDR(), memo: memoText });
    } catch (error) {
      res.status(400).json(jsonError(error));
    }
    return;
  }

  // Unknown action
  res.status(400).json({ error: `Unknown action: ${action}` });
}
