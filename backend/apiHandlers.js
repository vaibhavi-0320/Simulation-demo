import * as Sentry from "@sentry/node";
import { getServerlessAuthContext } from "./auth.ts";
import { getEnv } from "./env.ts";
import { HttpError, jsonError, statusForError } from "./errors.ts";
import { logger } from "./logger.ts";
import { assertRateLimit } from "./rateLimit.ts";
import * as service from "./service.ts";
import { chatSchema, confirmFundInvoiceSchema, emptyBodySchema, fundInvoiceSchema, invoiceActionQuerySchema, invoiceCreateSchema, parseInvoiceSchema, visitorSchema } from "./validation.ts";
let sentryReady = false;
function ensureSentry() {
    if (sentryReady)
        return;
    const env = getEnv();
    if (env.SENTRY_DSN) {
        Sentry.init({ dsn: env.SENTRY_DSN, environment: env.NODE_ENV });
    }
    sentryReady = true;
}
function sendError(res, error) {
    ensureSentry();
    const status = statusForError(error);
    const retryAfter = error instanceof Error && "retryAfter" in error ? Number(error.retryAfter) : 0;
    if (retryAfter)
        res.setHeader("Retry-After", String(retryAfter));
    if (status >= 500) {
        Sentry.captureException(error);
        logger.error({ error }, "serverless request failed");
    }
    else {
        logger.warn({ error: error instanceof Error ? error.message : error }, "serverless request rejected");
    }
    res.status(status).json(jsonError(error));
}
function requireMethod(req, allowed) {
    if (!allowed.includes(req.method)) {
        throw new HttpError(405, "Method not allowed.");
    }
}
export async function invoicesHandler(req, res) {
    try {
        requireMethod(req, ["GET", "POST"]);
        await assertRateLimit(req);
        const auth = await getServerlessAuthContext(req);
        if (req.method === "GET") {
            res.status(200).json({ success: true, data: await service.listInvoices(auth) });
            return;
        }
        res.status(201).json({ success: true, data: await service.createInvoice(auth, invoiceCreateSchema.parse(req.body)) });
    }
    catch (error) {
        sendError(res, error);
    }
}
export async function healthHandler(req, res) {
    try {
        requireMethod(req, ["GET"]);
        await assertRateLimit(req);
        await getServerlessAuthContext(req);
        res.status(200).json({ success: true, data: { status: "ok", service: "fintrix-api" } });
    }
    catch (error) {
        sendError(res, error);
    }
}
export async function transactionsHandler(req, res) {
    try {
        requireMethod(req, ["GET"]);
        await assertRateLimit(req);
        const auth = await getServerlessAuthContext(req);
        res.status(200).json({ success: true, data: await service.listTransactions(auth) });
    }
    catch (error) {
        sendError(res, error);
    }
}
export async function invoiceActionHandler(req, res) {
    try {
        requireMethod(req, ["POST"]);
        await assertRateLimit(req);
        const auth = await getServerlessAuthContext(req);
        const query = invoiceActionQuerySchema.parse(req.query);
        if (query.action === "fund") {
            logger.info({ body: req.body }, "fund-invoice request body");
            const body = fundInvoiceSchema.parse(req.body);
            res.status(200).json({
                success: true,
                data: await service.buildFundInvoiceTransaction({
                    invoiceId: query.id,
                    dealId: body.dealId,
                    investorWalletAddress: body.investorWalletAddress || body.funder,
                    amountUSD: body.amountUSD || body.amount || 0,
                    destinationWallet: body.destinationWallet,
                }),
            });
            return;
        }
        emptyBodySchema.parse(req.body || {});
        res.status(200).json({ success: true, data: await service.repayInvoice(auth, query.id) });
    }
    catch (error) {
        sendError(res, error);
    }
}
export async function parseInvoiceHandler(req, res) {
    try {
        requireMethod(req, ["POST"]);
        await assertRateLimit(req);
        await getServerlessAuthContext(req);
        const body = parseInvoiceSchema.parse(req.body);
        res.status(200).json({ success: true, data: await service.parseInvoice(body.fileBase64, body.mimeType) });
    }
    catch (error) {
        sendError(res, error);
    }
}
export async function chatHandler(req, res) {
    try {
        requireMethod(req, ["POST"]);
        await assertRateLimit(req);
        await getServerlessAuthContext(req);
        res.status(200).json({ success: true, data: await service.askAssistant(chatSchema.parse(req.body)) });
    }
    catch (error) {
        sendError(res, error);
    }
}
export async function trackVisitorHandler(req, res) {
    try {
        requireMethod(req, ["POST"]);
        await assertRateLimit(req);
        const auth = await getServerlessAuthContext(req);
        res.status(201).json({ success: true, data: await service.trackVisitor(auth, visitorSchema.parse(req.body)) });
    }
    catch (error) {
        sendError(res, error);
    }
}
export async function invoiceAllHandler(req, res) {
    try {
        requireMethod(req, ["GET"]);
        await assertRateLimit(req);
        const auth = await getServerlessAuthContext(req);
        res.status(200).json({ success: true, data: await service.listInvoices(auth) });
    }
    catch (error) {
        sendError(res, error);
    }
}
export async function invoiceUploadHandler(req, res) {
    try {
        requireMethod(req, ["POST"]);
        await assertRateLimit(req);
        await getServerlessAuthContext(req);
        const body = invoiceCreateSchema.parse(req.body);
        res.status(201).json({
            success: true,
            data: {
                id: body.number || `INV-${Date.now()}`,
                buyer: body.buyer,
                amount: body.amount,
                discount: body.discount,
                due: body.due,
                seller: body.seller,
                notes: body.notes || "Invoice ready for listing.",
            },
        });
    }
    catch (error) {
        sendError(res, error);
    }
}
export async function invoiceListHandler(req, res) {
    try {
        requireMethod(req, ["POST"]);
        await assertRateLimit(req);
        const auth = await getServerlessAuthContext(req);
        res.status(201).json({ success: true, data: await service.createInvoice(auth, invoiceCreateSchema.parse(req.body)) });
    }
    catch (error) {
        sendError(res, error);
    }
}
export async function invoiceFundHandler(req, res) {
    try {
        requireMethod(req, ["POST"]);
        await assertRateLimit(req);
        await getServerlessAuthContext(req);
        logger.info({ body: req.body }, "fund-invoice request body");
        if (req.body?.txHash) {
            const body = confirmFundInvoiceSchema.extend({ id: invoiceActionQuerySchema.shape.id.optional() }).parse(req.body);
            res.status(200).json({
                success: true,
                data: service.confirmFundInvoice({
                    invoiceId: body.invoiceId || body.id,
                    investorWalletAddress: body.investorWalletAddress || body.funder,
                    amountUSD: body.amountUSD || body.amount || 0,
                    txHash: body.txHash,
                }),
            });
            return;
        }
        const body = fundInvoiceSchema.extend({ id: invoiceActionQuerySchema.shape.id.optional() }).parse(req.body);
        res.status(200).json({
            success: true,
            data: await service.buildFundInvoiceTransaction({
                invoiceId: body.invoiceId || body.id,
                dealId: body.dealId,
                investorWalletAddress: body.investorWalletAddress || body.funder,
                amountUSD: body.amountUSD || body.amount || 0,
                destinationWallet: body.destinationWallet,
            }),
        });
    }
    catch (error) {
        sendError(res, error);
    }
}
