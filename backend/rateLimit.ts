import type { NextFunction, Request, Response } from "express";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getEnv } from "./env.ts";
import { HttpError } from "./errors.ts";

let redis: Redis | null = null;
let defaultLimiter: Ratelimit | null = null;
let authLimiter: Ratelimit | null = null;

function getRedis() {
  if (!redis) {
    const env = getEnv();
    if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error("Upstash Redis is not configured.");
    }
    redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

function getLimiter(kind: "default" | "auth") {
  if (kind === "auth") {
    authLimiter ??= new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      prefix: "fintrix:ratelimit:auth",
    });
    return authLimiter;
  }

  defaultLimiter ??= new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(20, "10 s"),
    prefix: "fintrix:ratelimit:api",
  });
  return defaultLimiter;
}

export function getClientIp(req: Request) {
  const forwarded = String(req.headers["x-forwarded-for"] || "");
  return forwarded.split(",")[0]?.trim() || req.ip || req.socket.remoteAddress || "unknown";
}

export async function assertRateLimit(req: Request, kind: "default" | "auth" = "default") {
  const env = getEnv();
  if (env.NODE_ENV !== "production" && env.SECURITY_RELAXED_LOCAL === "true") {
    return { remaining: 20, retryAfter: 1 };
  }

  const result = await getLimiter(kind).limit(`${kind}:${getClientIp(req)}`);
  const resetSeconds = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));

  if (!result.success) {
    throw new HttpError(429, "Too Many Requests.", { retryAfter: resetSeconds });
  }

  return { remaining: result.remaining, retryAfter: resetSeconds };
}

export function rateLimitMiddleware(kind: "default" | "auth" = "default") {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = await assertRateLimit(req, kind);
      res.setHeader("X-RateLimit-Remaining", String(limit.remaining));
      next();
    } catch (error) {
      next(error);
    }
  };
}
