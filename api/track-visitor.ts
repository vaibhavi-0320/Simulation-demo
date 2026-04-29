import { VercelRequest, VercelResponse } from "@vercel/node";
import { getBackendModules, withErrorHandling, jsonResponse, errorResponse } from "../_lib/handlers";

export default withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    return errorResponse(res, "Method not allowed", 405);
  }

  const { validation, service } = await getBackendModules();

  try {
    const body = validation.visitorSchema.parse({
      ...req.body,
      userAgent: req.body?.userAgent || req.headers["user-agent"],
      language: req.body?.language || req.headers["accept-language"],
    });
    const visitor = await service.trackVisitor(body);
    jsonResponse(res, { success: true, data: visitor }, 201);
  } catch (error: any) {
    errorResponse(res, error?.message || "Failed to track visitor", 400);
  }
});
