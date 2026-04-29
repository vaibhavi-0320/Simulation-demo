import { VercelRequest, VercelResponse } from "@vercel/node";
import * as StellarSdk from "@stellar/stellar-sdk";
import { withErrorHandling, jsonResponse, errorResponse, isValidStellarPublicKey, sanitizeAmount } from "../_lib/handlers";

const HORIZON = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
const PASSPHRASE = StellarSdk.Networks.TESTNET;
const ESCROW = process.env.ESCROW_DESTINATION?.trim() || "GBUWCRHTSXJ5WCERNSIKUFVTZ35M542OID4FRZI2TFNKEVVHSPY7PT5Z";

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
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
  } catch (e: any) {
    const status = e?.response?.status;
    if (status === 404) {
      return errorResponse(
        res,
        `Your wallet is not activated on Stellar testnet. Visit https://laboratory.stellar.org/#account-creator?network=test and fund: ${investorPublicKey}`,
        400
      );
    }
    return errorResponse(res, `Horizon loadAccount failed: ${e.message}`, 400);
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
  } catch (e: any) {
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
    jsonResponse(res, { xdr, xlmAmount, destination: ESCROW });
  } catch (e: any) {
    console.error("[BUILD] TransactionBuilder error:", e);
    return errorResponse(res, `Failed to build XDR: ${e.message}`, 500);
  }
});
