import cors from "cors";
import helmet from "helmet";
import * as Sentry from "@sentry/node";
import pinoHttp from "pino-http";
import type { Express, NextFunction, Request, Response } from "express";
import { clerkMiddleware } from "@clerk/express";
import { getAllowedOrigins, getEnv } from "./env.ts";
import { logger } from "./logger.ts";

export function configureSecurity(app: Express) {
  const env = getEnv();
  const allowedOrigins = getAllowedOrigins();

  if (env.SENTRY_DSN) {
    Sentry.init({ dsn: env.SENTRY_DSN, environment: env.NODE_ENV });
  }

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (env.NODE_ENV === "production" && env.FORCE_HTTPS === "true" && req.headers["x-forwarded-proto"] === "http") {
      res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
      return;
    }
    next();
  });

  app.use(pinoHttp({ logger }));
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
    originAgentCluster: false
  }));

  app.use((req, res, next) => {
    res.removeHeader('Cross-Origin-Opener-Policy');
    res.removeHeader('Cross-Origin-Embedder-Policy');
    res.removeHeader('Cross-Origin-Resource-Policy');
    next();
  });

  app.use((_req, res, next) => {
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
    next();
  });

  app.use(cors({
    origin: (origin, callback) => {
      const allowed = [
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        /\.vercel\.app$/,  // allows any vercel.app subdomain
      ];
      if (!origin) return callback(null, true); // allow server-to-server
      const isAllowed = allowed.some(a =>
        typeof a === 'string' ? a === origin : a.test(origin)
      );
      callback(null, isAllowed);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
  }));

  app.options('*', cors());

  if (!(env.NODE_ENV !== "production" && env.SECURITY_RELAXED_LOCAL === "true")) {
    app.use(clerkMiddleware({ authorizedParties: allowedOrigins }));
  }
}
