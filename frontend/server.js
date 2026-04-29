import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import expressRateLimit from "express-rate-limit";
import * as StellarSdk from '@stellar/stellar-sdk';
import http from "http";
import net from "net";
import path from "path";
import { createServer as createViteServer } from "vite";
dotenv.config();
dotenv.config({ path: ".env.local", override: true });
const REQUIRED_ENV = ["ESCROW_DESTINATION"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
    console.error("[FINTRIX SECURITY] Missing env vars:", missing.join(", "));
    console.error("[FINTRIX SECURITY] Create frontend/.env.local with these values.");
}
const DEFAULT_PORT = 3000;
function isValidStellarPublicKey(key) {
    return typeof key === "string" &&
        key.length === 56 &&
        key.startsWith("G") &&
        /^[A-Z2-7]+$/.test(key);
}
function sanitizeAmount(val) {
    const n = Number(val);
    if (Number.isNaN(n) || n < 1 || n > 1_000_000) {
        return null;
    }
    return n;
}
async function resolveAvailablePort(startPort) {
    const tryPort = (port) => new Promise((resolve, reject) => {
        const tester = net.createServer();
        tester.once("error", (error) => {
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
    app.use(helmet({
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: false,
    }));
    security.configureSecurity(app);
    app.use(express.json({ limit: "10mb" }));
    const fundingLimiter = expressRateLimit({
        windowMs: 60 * 1000,
        max: 10,
        message: { error: "Too many requests. Please wait before trying again." },
        standardHeaders: true,
        legacyHeaders: false,
    });
    const generalLimiter = expressRateLimit({
        windowMs: 60 * 1000,
        max: 100,
        message: { error: "Rate limit exceeded." },
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use("/api/stellar/build", fundingLimiter);
    app.use("/api/stellar/submit", fundingLimiter);
    app.use("/api/stellar/build-simulation", fundingLimiter);
    app.use("/api", generalLimiter);
    // Rate limiting on all /api routes
    app.use("/api", rateLimit.rateLimitMiddleware("default"));
    // Wallet Authentication Endpoints (public, no auth required)
    const walletAuth = await import("../backend/wallet-auth.ts");
    app.post("/api/auth/challenge", async (req, res, next) => {
        try {
            const body = validation.addressSchema.parse(req.body);
            const result = await walletAuth.createChallenge(body.address);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    });
    app.post("/api/auth/verify", async (req, res, next) => {
        try {
            const body = validation.signatureSchema.parse(req.body);
            const result = await walletAuth.verifySignature(body.address, body.signature, body.nonce);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    });
    const HORIZON = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
    const PASSPHRASE = StellarSdk.Networks.TESTNET;
    const ESCROW = process.env.ESCROW_DESTINATION?.trim() ||
        'GBUWCRHTSXJ5WCERNSIKUFVTZ35M542OID4FRZI2TFNKEVVHSPY7PT5Z';
    app.use((req, _res, next) => {
        if (req.path.includes("/api/stellar")) {
            console.info("[FINTRIX API]", req.method, req.path);
        }
        next();
    });
    app.get('/api/stellar/health', async (_req, res) => {
        try {
            const acc = await HORIZON.loadAccount(ESCROW);
            const xlm = acc.balances.find((b) => b.asset_type === 'native');
            res.json({ ok: true, escrow: ESCROW, balance: xlm?.balance });
        }
        catch (e) {
            res.status(500).json({ ok: false, error: e.message, escrow: ESCROW });
        }
    });
    app.post('/api/stellar/build', async (req, res) => {
        const { investorPublicKey, amountUSD, invoiceId } = req.body;
        const safeAmount = sanitizeAmount(amountUSD);
        if (!isValidStellarPublicKey(investorPublicKey)) {
            return res.status(400).json({ error: "Invalid Stellar public key format." });
        }
        if (!safeAmount) {
            return res.status(400).json({ error: "Invalid amount. Must be between $1 and $1,000,000." });
        }
        if (!invoiceId) {
            return res.status(400).json({ error: 'Missing invoiceId' });
        }
        let account;
        try {
            account = await HORIZON.loadAccount(investorPublicKey);
        }
        catch (e) {
            const status = e?.response?.status;
            if (status === 404) {
                return res.status(400).json({
                    error: `Your wallet is not activated on Stellar testnet. Visit https://laboratory.stellar.org/#account-creator?network=test and fund: ${investorPublicKey}`
                });
            }
            return res.status(400).json({ error: `Horizon loadAccount failed: ${e.message}` });
        }
        const xlmBal = account.balances.find((b) => b.asset_type === 'native');
        const xlmNeeded = (safeAmount / 0.11) + 2;
        if (!xlmBal || parseFloat(xlmBal.balance) < xlmNeeded) {
            return res.status(400).json({
                error: `Insufficient XLM. Need ${xlmNeeded.toFixed(2)} XLM, have ${xlmBal?.balance || 0} XLM. Fund at Friendbot.`
            });
        }
        try {
            await HORIZON.loadAccount(ESCROW);
        }
        catch (e) {
            return res.status(400).json({
                error: `Escrow account not on testnet: ${ESCROW}. Fund it at Friendbot first.`
            });
        }
        const xlmAmount = (safeAmount / 0.11).toFixed(7);
        const memo = `INV:${String(invoiceId).substring(0, 22)}`;
        try {
            const tx = new StellarSdk.TransactionBuilder(account, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase: PASSPHRASE,
            })
                .addOperation(StellarSdk.Operation.payment({
                destination: ESCROW,
                asset: StellarSdk.Asset.native(),
                amount: xlmAmount,
            }))
                .addMemo(StellarSdk.Memo.text(memo))
                .setTimeout(30)
                .build();
            const xdr = tx.toXDR();
            return res.json({ xdr, xlmAmount, destination: ESCROW });
        }
        catch (e) {
            console.error('[BUILD] TransactionBuilder error:', e);
            return res.status(500).json({ error: `Failed to build XDR: ${e.message}` });
        }
    });
    app.post('/api/stellar/submit', async (req, res) => {
        const { signedXdr, amountUSD } = req.body;
        if (!signedXdr) {
            return res.status(400).json({ error: 'Missing signedXdr' });
        }
        if (amountUSD !== undefined && amountUSD !== null && !sanitizeAmount(amountUSD)) {
            return res.status(400).json({ error: "Invalid amount. Must be between $1 and $1,000,000." });
        }
        let txResult;
        try {
            const tx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, PASSPHRASE);
            txResult = await HORIZON.submitTransaction(tx);
        }
        catch (e) {
            const codes = e?.response?.data?.extras?.result_codes;
            const detail = e?.response?.data?.extras?.result_xdr;
            console.error('[SUBMIT] Horizon error:', JSON.stringify(codes), detail);
            return res.status(400).json({
                error: codes
                    ? `Stellar rejected: ${JSON.stringify(codes)}`
                    : `Submit failed: ${e.message}`
            });
        }
        return res.json({
            success: true,
            txHash: txResult.hash,
            explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txResult.hash}`
        });
    });
    app.post('/api/stellar/build-simulation', async (req, res) => {
        const { investorPublicKey, amountUSD, invoiceId, dealId } = req.body;
        const safeAmount = sanitizeAmount(amountUSD);
        if (!isValidStellarPublicKey(investorPublicKey)) {
            return res.status(400).json({ error: "Invalid Stellar public key format." });
        }
        if (!safeAmount) {
            return res.status(400).json({ error: "Invalid amount. Must be between $1 and $1,000,000." });
        }
        let account;
        try {
            account = await HORIZON.loadAccount(investorPublicKey);
        }
        catch (e) {
            if (e?.response?.status === 404) {
                return res.status(400).json({
                    error: 'Wallet not activated on testnet. Fund at: https://laboratory.stellar.org/#account-creator?network=test'
                });
            }
            return res.status(400).json({ error: `Account load failed: ${e.message}` });
        }
        const xlmBal = account.balances.find((b) => b.asset_type === 'native');
        if (!xlmBal || parseFloat(xlmBal.balance) < 2) {
            return res.status(400).json({
                error: `Need at least 2 XLM for simulation. Current: ${xlmBal?.balance || 0} XLM`
            });
        }
        const memoText = `SIM:${String(dealId || invoiceId).substring(0, 20)}`;
        try {
            const tx = new StellarSdk.TransactionBuilder(account, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase: PASSPHRASE,
            })
                .addOperation(StellarSdk.Operation.payment({
                destination: investorPublicKey,
                asset: StellarSdk.Asset.native(),
                amount: '1.0000000',
            }))
                .addMemo(StellarSdk.Memo.text(memoText))
                .setTimeout(30)
                .build();
            const xdr = tx.toXDR();
            return res.json({ xdr, memo: memoText });
        }
        catch (e) {
            console.error('[SIM-BUILD] build error:', e);
            return res.status(500).json({ error: `Build failed: ${e.message}` });
        }
    });
    // Require Clerk auth for the rest of /api routes
    app.use("/api", auth.requireAuthJson);
    app.get("/api/health", (_req, res) => res.json({ success: true, data: { status: "ok", service: "fintrix-api", port: resolvedPort } }));
    app.get("/api/invoices", async (req, res, next) => {
        try {
            const result = await service.listInvoices();
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    });
    app.get("/api/invoice/all", async (req, res, next) => {
        try {
            const result = await service.listInvoices();
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    });
    app.get("/api/transactions", async (req, res, next) => {
        try {
            const result = await service.listTransactions();
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    });
    app.get("/api/portfolio/:walletAddress", async (req, res, next) => {
        try {
            const { walletAddress } = req.params;
            if (!isValidStellarPublicKey(walletAddress)) {
                res.status(400).json({ error: "Invalid Stellar public key format." });
                return;
            }
            const result = await service.listInvoices();
            const invoices = result.filter(inv => inv.funder === walletAddress);
            const totalInvested = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
            const activeInvoices = invoices.filter(inv => inv.status === 'funded').length;
            const averageAPY = invoices.length > 0
                ? invoices.reduce((sum, inv) => sum + (inv.yield || 8.2), 0) / invoices.length
                : 0;
            res.json({ totalInvested, activeInvoices, averageAPY });
        }
        catch (error) {
            next(error);
        }
    });
    app.get("/api/visitors", async (req, res, next) => {
        try {
            const result = await service.listVisitors();
            res.json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    });
    app.post("/api/invoices", async (req, res, next) => {
        try {
            const body = validation.invoiceCreateSchema.parse(req.body);
            const result = await service.createInvoice(body);
            res.status(201).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    });
    app.post("/api/invoice/upload", async (req, res, next) => {
        try {
            const body = validation.invoiceCreateSchema.parse(req.body);
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
        }
        catch (error) {
            next(error);
        }
    });
    app.post("/api/invoice/list", async (req, res, next) => {
        try {
            const body = validation.invoiceCreateSchema.parse(req.body);
            const result = await service.createInvoice(body);
            res.status(201).json({ success: true, data: result });
        }
        catch (error) {
            next(error);
        }
    });
    app.post("/api/invoice-action", async (req, res, next) => {
        try {
            const query = validation.invoiceActionQuerySchema.parse(req.query);
            if (query.action === "repay") {
                validation.emptyBodySchema.parse(req.body || {});
                const result = await service.repayInvoice(query.id);
                res.json({ success: true, data: result });
                return;
            }
            res.status(400).json({ success: false, error: "Unknown action." });
        }
        catch (error) {
            next(error);
        }
    });
    app.post("/api/ai-parse", async (req, res, next) => {
        try {
            const body = validation.parseInvoiceSchema.parse(req.body);
            res.json({ success: true, data: await service.parseInvoice(body.fileBase64, body.mimeType) });
        }
        catch (error) {
            next(error);
        }
    });
    app.post("/api/chat", async (req, res, next) => {
        try {
            res.json({ success: true, data: await service.askAssistant(validation.chatSchema.parse(req.body)) });
        }
        catch (error) {
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
            const visitor = await service.trackVisitor(body);
            res.status(201).json({ success: true, data: visitor });
        }
        catch (error) {
            next(error);
        }
    });
    if (process.env.NODE_ENV !== "production") {
        // Dev mode: integrate Vite as middleware for full HMR + React app
        const vite = await createViteServer({
            server: {
                middlewareMode: true,
                hmr: { server: httpServer },
            },
            appType: "spa",
        });
        app.use(vite.middlewares);
    }
    else {
        const distPath = path.join(process.cwd(), "dist");
        app.use(express.static(distPath));
        app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
    }
    app.use((error, req, res, next) => errors.errorHandler(error, req, res, next));
    // Error handler for listen failures
    httpServer.once("error", (error) => {
        if (error.code === "EADDRINUSE") {
            logger.warn({ port: resolvedPort }, "Port already in use, trying next port");
            resolveAvailablePort(resolvedPort + 1).then((nextPort) => {
                httpServer.listen(nextPort, "127.0.0.1");
            });
        }
        else {
            logger.error({ error }, "Server listen error");
            throw error;
        }
    });
    httpServer.listen(resolvedPort, "127.0.0.1", () => {
        const actualPort = httpServer.address()?.port || resolvedPort;
        console.log(`fintrix dev server running on http://127.0.0.1:${actualPort}`);
        console.log("[FINTRIX SECURITY] Server started securely");
        // Start Horizon listener for contract events
        const contractAddress = env.getEnv().SOROBAN_CONTRACT_ADDRESS;
        if (contractAddress) {
            horizon.startHorizonListener(contractAddress);
        }
        else {
            console.warn("SOROBAN_CONTRACT_ADDRESS not set, Horizon listener not started");
        }
    });
}
void startServer();
