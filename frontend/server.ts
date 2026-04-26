import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import http from "http";
import net from "net";
import path from "path";
import { createServer as createViteServer } from "vite";

dotenv.config();

const DEFAULT_PORT = 5173;

async function resolveAvailablePort(startPort: number): Promise<number> {
  const tryPort = (port: number) =>
    new Promise<number>((resolve, reject) => {
      const tester = net.createServer();

      tester.once("error", (error: NodeJS.ErrnoException) => {
        tester.close();
        if (error.code === "EADDRINUSE") {
          console.warn(`Port ${port} is busy. Retrying on ${port + 1}...`);
          resolve(tryPort(port + 1));
          return;
        }
        reject(error);
      });

      tester.once("listening", () => {
        tester.close(() => resolve(port));
      });

      tester.listen(port, "127.0.0.1");
    });

  return tryPort(startPort);
}

async function startServer() {
  const [auth, env, errors, horizon, rateLimit, security, service, validation] = await Promise.all([
    import("../backend/auth.ts"),
    import("../backend/env.ts"),
    import("../backend/errors.ts"),
    import("../backend/horizon.ts"),
    import("../backend/rateLimit.ts"),
    import("../backend/security.ts"),
    import("../backend/service.ts"),
    import("../backend/validation.ts"),
  ]);
  const { logger } = await import("../backend/logger.ts");

  env.assertEnvReady();
  const app = express();
  const preferredPort = Number(process.env.PORT || process.env.APP_PORT || DEFAULT_PORT);
  const resolvedPort = await resolveAvailablePort(preferredPort);
  const httpServer = http.createServer(app);

  security.configureSecurity(app);
  app.use(express.json({ limit: "10mb" }));

  // Rate limiting on all /api routes
  app.use("/api", rateLimit.rateLimitMiddleware("default"));

  // Wallet Authentication Endpoints (public, no auth required)
  const walletAuth = await import("../backend/wallet-auth.ts");
  
  app.post("/api/auth/challenge", async (req, res, next) => {
    try {
      const body = validation.addressSchema.parse(req.body);
      const result = await walletAuth.createChallenge(body.address);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/verify", async (req, res, next) => {
    try {
      const body = validation.signatureSchema.parse(req.body);
      const result = await walletAuth.verifySignature(body.address, body.signature, body.nonce);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // Require Clerk auth for the rest of /api routes
  app.use("/api", auth.requireAuthJson);

  app.get("/api/health", (_req, res) => res.json({ success: true, data: { status: "ok", service: "fintrix-api", port: resolvedPort } }));
  app.get("/api/invoices", async (req, res, next) => {
    try {
      const result = await service.listInvoices(auth.getAuthContext(req));
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  });
  app.get("/api/invoice/all", async (req, res, next) => {
    try {
      const result = await service.listInvoices(auth.getAuthContext(req));
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  });
  app.get("/api/transactions", async (req, res, next) => {
    try {
      const result = await service.listTransactions(auth.getAuthContext(req));
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  });
  app.get("/api/visitors", async (req, res, next) => {
    try {
      const result = await service.listVisitors(auth.getAuthContext(req));
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/invoices", async (req, res, next) => {
    try {
      const body = validation.invoiceCreateSchema.parse(req.body) as Parameters<typeof service.createInvoice>[1];
      const result = await service.createInvoice(auth.getAuthContext(req), body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/invoice/upload", async (req, res, next) => {
    try {
      const body = validation.invoiceCreateSchema.parse(req.body) as Parameters<typeof service.createInvoice>[1];
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
      res.status(201).json({ success: true, data: preview });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/invoice/list", async (req, res, next) => {
    try {
      const body = validation.invoiceCreateSchema.parse(req.body) as Parameters<typeof service.createInvoice>[1];
      const result = await service.createInvoice(auth.getAuthContext(req), body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/invoice-action", async (req, res, next) => {
    try {
      const query = validation.invoiceActionQuerySchema.parse(req.query);
      if (query.action === "fund") {
        const body = validation.fundInvoiceSchema.parse(req.body);
        const result = await service.fundInvoice(auth.getAuthContext(req), query.id, body.funder, body.amount);
        res.json({ success: true, data: result });
        return;
      }
      if (query.action === "repay") {
        validation.emptyBodySchema.parse(req.body || {});
        const result = await service.repayInvoice(auth.getAuthContext(req), query.id);
        res.json({ success: true, data: result });
        return;
      }
      res.status(400).json({ success: false, error: "Unknown action." });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/invoice/fund", async (req, res, next) => {
    try {
      const body = validation.fundInvoiceSchema.extend({ id: validation.invoiceActionQuerySchema.shape.id }).parse(req.body);
      const result = await service.fundInvoice(auth.getAuthContext(req), body.id, body.funder, body.amount);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/ai-parse", async (req, res, next) => {
    try {
      const body = validation.parseInvoiceSchema.parse(req.body);
      res.json({ success: true, data: await service.parseInvoice(body.fileBase64, body.mimeType) });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/chat", async (req, res, next) => {
    try {
      res.json({ success: true, data: await service.askAssistant(validation.chatSchema.parse(req.body) as Parameters<typeof service.askAssistant>[0]) });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/track-visitor", async (req, res, next) => {
    try {
      const body = validation.visitorSchema.parse({
        ...req.body,
        userAgent: req.body?.userAgent || req.headers["user-agent"],
        language: req.body?.language || req.headers["accept-language"],
      });
      const visitor = await service.trackVisitor(auth.getAuthContext(req), body);
      res.status(201).json({ success: true, data: visitor });
    } catch (error) {
      next(error);
    }
  });

  if (process.env.NODE_ENV !== "production") {
    // Dev mode: integrate Vite as middleware for full HMR + React app
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.use((error: unknown, req: Request, res: Response, next: NextFunction) => errors.errorHandler(error, req, res, next));

  httpServer.listen(resolvedPort, "127.0.0.1", () => {
    const actualPort = (httpServer.address() as any)?.port || resolvedPort;
    console.log(`fintrix dev server running on http://127.0.0.1:${actualPort}`);
    
    // Start Horizon listener for contract events
    const contractAddress = env.getEnv().SOROBAN_CONTRACT_ADDRESS;
    if (contractAddress) {
      horizon.startHorizonListener(contractAddress);
    } else {
      console.warn("SOROBAN_CONTRACT_ADDRESS not set, Horizon listener not started");
    }
  });
}

void startServer();
