import cors from "cors";
import helmet from "helmet";
import * as Sentry from "@sentry/node";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { getAllowedOrigins, getEnv } from "./env.ts";
import { logger } from "./logger.ts";
export function configureSecurity(app) {
    const env = getEnv();
    const allowedOrigins = getAllowedOrigins();
    if (env.SENTRY_DSN) {
        Sentry.init({ dsn: env.SENTRY_DSN, environment: env.NODE_ENV });
    }
    app.disable("x-powered-by");
    app.set("trust proxy", 1);
    app.use((req, res, next) => {
        if (env.NODE_ENV === "production" && env.FORCE_HTTPS === "true" && req.headers["x-forwarded-proto"] === "http") {
            res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
            return;
        }
        next();
    });
    app.use(pinoHttp({ logger }));
    app.use(helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                "default-src": ["'self'"],
                "base-uri": ["'self'"],
                "frame-ancestors": ["'none'"],
                "connect-src": [
                    "'self'",
                    "https://*.clerk.accounts.dev",
                    "https://*.clerk.com",
                    "https://horizon-testnet.stellar.org",
                    ...(env.NODE_ENV !== "production" ? ["ws://127.0.0.1:*", "ws://localhost:*"] : [])
                ],
                "script-src": ["'self'", "'unsafe-inline'", "https://*.clerk.accounts.dev", "https://*.clerk.com"],
                "style-src": ["'self'", "'unsafe-inline'", "https://api.fontshare.com"],
                "font-src": ["'self'", "https://api.fontshare.com", "https://cdn.fontshare.com", "data:"],
                "img-src": ["'self'", "data:", "blob:", "https:"],
                "media-src": ["'self'", "https://d8j0ntlcm91z4.cloudfront.net"],
            },
        },
        crossOriginEmbedderPolicy: false,
        frameguard: { action: "deny" },
        hsts: env.NODE_ENV === "production" ? { maxAge: 31_536_000, includeSubDomains: true } : false,
        noSniff: true,
        referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    }));
    app.use((_req, res, next) => {
        res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
        next();
    });
    app.use(cors({
        credentials: true,
        origin(origin, callback) {
            // In development, allow localhost and 127.0.0.1 with any port
            if (env.NODE_ENV !== "production" && origin && (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:"))) {
                callback(null, true);
                return;
            }
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }
            callback(new Error("CORS origin is not allowed."));
        },
    }));
    if (!(env.NODE_ENV !== "production" && env.SECURITY_RELAXED_LOCAL === "true")) {
        app.use(clerkMiddleware({ authorizedParties: allowedOrigins }));
    }
}
