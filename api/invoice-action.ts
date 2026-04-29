import { VercelRequest, VercelResponse } from "@vercel/node";
import { getBackendModules, withErrorHandling, jsonResponse, errorResponse } from "../_lib/handlers";

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    return errorResponse(res, "Method not allowed", 405);
  }

  const { validation, service } = await getBackendModules();

  try {
    const query = validation.invoiceActionQuerySchema.parse(req.query);
    if (query.action === "repay") {
      validation.emptyBodySchema.parse(req.body || {});
      const result = await service.repayInvoice(query.id);
      jsonResponse(res, { success: true, data: result });
      return;
    }
    errorResponse(res, "Unknown action.", 400);
  } catch (error: any) {
    errorResponse(res, error?.message || "Failed to perform invoice action", 400);
  }
});
