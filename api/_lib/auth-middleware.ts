import { VercelRequest, VercelResponse } from "@vercel/node";
import { getBackendModules } from "./handlers";

export function withAuthMiddleware(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void>
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      const { auth } = await getBackendModules();
      await auth.requireAuthJson(req as any, res as any, async () => {
        await handler(req, res);
      });
    } catch (error: any) {
      console.error("[AUTH ERROR]", error);
      res.status(401).json({
        error: error?.message || "Unauthorized",
      });
    }
  };
}
