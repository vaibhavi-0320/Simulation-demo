import { VercelRequest, VercelResponse } from "@vercel/node";
import { getBackendModules, withErrorHandling, jsonResponse, errorResponse } from "../_lib/handlers";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    return errorResponse(res, "Method not allowed", 405);
  }

  const { validation, service } = await getBackendModules();

  try {
    const body = validation.invoiceCreateSchema.parse(req.body) as Parameters<
      typeof service.createInvoice
    >[0];
    const result = await service.createInvoice(body);
    jsonResponse(res, { success: true, data: result }, 201);
  } catch (error: any) {
    errorResponse(res, error?.message || "Failed to list invoice", 400);
  }
});
