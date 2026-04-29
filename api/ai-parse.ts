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
    const body = validation.parseInvoiceSchema.parse(req.body);
    const data = await service.parseInvoice(body.fileBase64, body.mimeType);
    jsonResponse(res, { success: true, data });
  } catch (error: any) {
    errorResponse(res, error?.message || "Failed to parse invoice", 400);
  }
});
