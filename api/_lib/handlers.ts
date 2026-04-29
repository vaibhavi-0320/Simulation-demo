import { VercelRequest, VercelResponse } from "@vercel/node";
import * as StellarSdk from "@stellar/stellar-sdk";
import type { Request as ExpressRequest, Response as ExpressResponse } from "express";

// Re-export backend modules
export async function getBackendModules() {
  const [auth, env, errors, horizon, rateLimit, security, service, validation] = await Promise.all([
    import("../../backend/auth.ts"),
    import("../../backend/env.ts"),
    import("../../backend/errors.ts"),
    import("../../backend/horizon.ts"),
    import("../../backend/rateLimit.ts"),
    import("../../backend/security.ts"),
    import("../../backend/service.ts"),
    import("../../backend/validation.ts"),
  ]);
  const { logger } = await import("../../backend/logger.ts");
  return { auth, env, errors, horizon, rateLimit, security, service, validation, logger };
}

export function isValidStellarPublicKey(key: any): boolean {
  return (
    typeof key === "string" &&
    key.length === 56 &&
    key.startsWith("G") &&
    /^[A-Z2-7]+$/.test(key)
  );
}

export function sanitizeAmount(val: any): number | null {
  const n = Number(val);
  if (Number.isNaN(n) || n < 1 || n > 1_000_000) {
    return null;
  }
  return n;
}

export function jsonResponse(res: VercelResponse, data: any, status = 200) {
  res.status(status).json(data);
}

export function errorResponse(res: VercelResponse, message: string, status = 400) {
  res.status(status).json({ error: message });
}

export function withErrorHandling(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void>
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      await handler(req, res);
    } catch (error: any) {
      console.error("[API ERROR]", error);
      res.status(500).json({
        error: error?.message || "Internal server error",
      });
    }
  };
}
