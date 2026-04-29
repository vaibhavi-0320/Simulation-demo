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
    const body = validation.chatSchema.parse(
      req.body
    ) as Parameters<typeof service.askAssistant>[0];
    const data = await service.askAssistant(body);
    jsonResponse(res, { success: true, data });
  } catch (error: any) {
    errorResponse(res, error?.message || "Failed to get chat response", 400);
  }
});
