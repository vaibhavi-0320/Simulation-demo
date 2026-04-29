import { VercelRequest, VercelResponse } from "@vercel/node";
import * as StellarSdk from "@stellar/stellar-sdk";
import { withErrorHandling, jsonResponse, errorResponse, sanitizeAmount } from "../_lib/handlers";

const HORIZON = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
const PASSPHRASE = StellarSdk.Networks.TESTNET;

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
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
  } catch (e: any) {
    const codes = e?.response?.data?.extras?.result_codes;
    const detail = e?.response?.data?.extras?.result_xdr;
    console.error("[SUBMIT] Horizon error:", JSON.stringify(codes), detail);
    return errorResponse(
      res,
      codes
        ? `Stellar rejected: ${JSON.stringify(codes)}`
        : `Submit failed: ${e.message}`,
      400
    );
  }

  jsonResponse(res, {
    success: true,
    txHash: txResult.hash,
    explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txResult.hash}`,
  });
});
