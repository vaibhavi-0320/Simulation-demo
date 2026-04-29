import { VercelRequest, VercelResponse } from "@vercel/node";
import { getBackendModules, withErrorHandling, jsonResponse, errorResponse } from "../_lib/handlers";

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "GET") {
    return errorResponse(res, "Method not allowed", 405);
  }

  const { service } = await getBackendModules();

  try {
    const result = await service.listVisitors();
    jsonResponse(res, { success: true, data: result });
  } catch (error: any) {
    errorResponse(res, error?.message || "Failed to list visitors", 500);
  }
});
