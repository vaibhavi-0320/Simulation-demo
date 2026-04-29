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

  const { validation, logger } = await getBackendModules();

  try {
    const body = validation.invoiceCreateSchema.parse(req.body);
    const preview = {
      id: body.number || `INV-${Date.now()}`,
      buyer: body.buyer,
      amount: body.amount,
      discount: body.discount,
      due: body.due,
      seller: body.seller,
      notes: body.notes || "Invoice ready for listing.",
    };
    logger.info({ invoiceId: preview.id, buyer: preview.buyer }, "invoice upload accepted");
    jsonResponse(res, { success: true, data: preview }, 201);
  } catch (error: any) {
    errorResponse(res, error?.message || "Failed to upload invoice", 400);
  }
});
