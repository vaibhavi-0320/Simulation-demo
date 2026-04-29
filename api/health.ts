import { VercelRequest, VercelResponse } from "@vercel/node";
import { getBackendModules, withErrorHandling, jsonResponse, errorResponse } from "../_lib/handlers";
import { withAuthMiddleware } from "../_lib/auth-middleware";

const handler = withErrorHandling(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "GET") {
    return errorResponse(res, "Method not allowed", 405);
  }

  // For development, allow without auth
  if (process.env.NODE_ENV !== "production") {
    return jsonResponse(res, {
      success: true,
      data: { status: "ok", service: "fintrix-api" },
    });
  }

  // In production, auth middleware will be applied
  return jsonResponse(res, {
    success: true,
    data: { status: "ok", service: "fintrix-api" },
  });
});

export default handler;
