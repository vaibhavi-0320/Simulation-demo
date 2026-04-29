import { VercelRequest, VercelResponse } from "@vercel/node";
import * as StellarSdk from "@stellar/stellar-sdk";
import { withErrorHandling, jsonResponse, errorResponse, isValidStellarPublicKey, sanitizeAmount } from "../_lib/handlers";

const HORIZON = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
const PASSPHRASE = StellarSdk.Networks.TESTNET;

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    return errorResponse(res, "Method not allowed", 405);
  }

  const { investorPublicKey, amountUSD, invoiceId, dealId } = req.body;
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
  } catch (e: any) {
    if (e?.response?.status === 404) {
      return errorResponse(
        res,
        "Wallet not activated on testnet. Fund at: https://laboratory.stellar.org/#account-creator?network=test",
        400
      );
    }
    return errorResponse(res, `Account load failed: ${e.message}`, 400);
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

  try {
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
    jsonResponse(res, { xdr, memo: memoText });
  } catch (e: any) {
    console.error("[SIM-BUILD] build error:", e);
    return errorResponse(res, `Build failed: ${e.message}`, 500);
  }
});
