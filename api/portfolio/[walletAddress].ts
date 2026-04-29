import { VercelRequest, VercelResponse } from "@vercel/node";
import { getBackendModules, withErrorHandling, jsonResponse, errorResponse, isValidStellarPublicKey } from "../_lib/handlers";

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "GET") {
    return errorResponse(res, "Method not allowed", 405);
  }

  const { walletAddress } = req.query;
  const { service } = await getBackendModules();

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

    jsonResponse(res, { totalInvested, activeInvoices, averageAPY });
  } catch (error: any) {
    errorResponse(res, error?.message || "Failed to get portfolio", 500);
  }
});
