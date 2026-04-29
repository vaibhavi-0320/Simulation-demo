import { VercelRequest, VercelResponse } from "@vercel/node";
import * as StellarSdk from "@stellar/stellar-sdk";
import { withErrorHandling, jsonResponse, errorResponse } from "../_lib/handlers";

const HORIZON = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
const ESCROW = process.env.ESCROW_DESTINATION?.trim() || "GBUWCRHTSXJ5WCERNSIKUFVTZ35M542OID4FRZI2TFNKEVVHSPY7PT5Z";

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "GET") {
    return errorResponse(res, "Method not allowed", 405);
  }

  try {
    const acc = await HORIZON.loadAccount(ESCROW);
    const xlm = acc.balances.find((b: any) => b.asset_type === "native");
    jsonResponse(res, {
      ok: true,
      escrow: ESCROW,
      balance: xlm?.balance,
    });
  } catch (e: any) {
    res.status(500).json({
      ok: false,
      error: e.message,
      escrow: ESCROW,
    });
  }
});
