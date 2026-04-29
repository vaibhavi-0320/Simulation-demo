import dotenv from "dotenv";
import { z } from "zod";
import { logger } from "./logger.ts";
dotenv.config();
const optionalUrl = z.string().url().optional().or(z.literal(""));
const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    SECURITY_RELAXED_LOCAL: z.enum(["true", "false"]).optional().default("false"),
    PORT: z.string().optional(),
    APP_PORT: z.string().optional(),
    APP_ORIGIN: z.string().optional().default("http://127.0.0.1:4517"),
    CLERK_SECRET_KEY: z.string().optional(),
    CLERK_ADMIN_USER_IDS: z.string().optional().default(""),
    VITE_CLERK_PUBLISHABLE_KEY: z.string().optional(),
    UPSTASH_REDIS_REST_URL: z.string().url("UPSTASH_REDIS_REST_URL must be a URL").optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    SENTRY_DSN: optionalUrl,
    DATABASE_URL: optionalUrl,
    SUPABASE_URL: z.string().url().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    JWT_SECRET: z.string().optional(),
    SOROBAN_CONTRACT_ADDRESS: z.string().optional(),
    FORCE_HTTPS: z.enum(["true", "false"]).optional().default("true"),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).optional().default("info"),
});
let cachedEnv = null;
export function getEnv() {
    if (!cachedEnv) {
        const parsed = envSchema.safeParse(process.env);
        if (!parsed.success) {
            const message = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
            throw new Error(`Missing or invalid environment configuration: ${message}`);
        }
        if (parsed.data.NODE_ENV === "production" || parsed.data.SECURITY_RELAXED_LOCAL !== "true") {
            const missing = [
                ["CLERK_SECRET_KEY", parsed.data.CLERK_SECRET_KEY],
                ["VITE_CLERK_PUBLISHABLE_KEY", parsed.data.VITE_CLERK_PUBLISHABLE_KEY],
                ["UPSTASH_REDIS_REST_URL", parsed.data.UPSTASH_REDIS_REST_URL],
                ["UPSTASH_REDIS_REST_TOKEN", parsed.data.UPSTASH_REDIS_REST_TOKEN],
            ].filter(([, value]) => !value).map(([key]) => key);
            if (missing.length) {
                throw new Error(`Missing required security environment variables: ${missing.join(", ")}. For local demos only, set SECURITY_RELAXED_LOCAL=true.`);
            }
        }
        cachedEnv = parsed.data;
    }
    return cachedEnv;
}
export function getAllowedOrigins() {
    const env = getEnv();
    const origins = env.APP_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean);
    if (env.NODE_ENV !== "production") {
        origins.push("http://127.0.0.1:4517", "http://localhost:4517", "http://127.0.0.1:5173", "http://localhost:5173");
    }
    return Array.from(new Set(origins));
}
export function assertEnvReady() {
    const env = getEnv();
    logger.info({ origins: getAllowedOrigins(), sentryEnabled: Boolean(env.SENTRY_DSN) }, "environment validated");
    return env;
}
