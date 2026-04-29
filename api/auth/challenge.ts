import { VercelRequest, VercelResponse } from "@vercel/node";
import { getBackendModules, withErrorHandling, jsonResponse, errorResponse } from "../_lib/handlers";

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    return errorResponse(res, "Method not allowed", 405);
  }

  const { validation } = await getBackendModules();

  try {
    const body = validation.addressSchema.parse(req.body);
    const { walletAuth } = await import("../../backend/wallet-auth.ts");
    const result = await walletAuth.createChallenge(body.address);
    jsonResponse(res, result);
  } catch (error: any) {
    errorResponse(res, error?.message || "Invalid request", 400);
  }
});
