// @ts-nocheck
import sanitizeHtml from "sanitize-html";
import { z } from "zod";
const strippedTextOptions = {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
};
export function sanitizeString(value) {
    return sanitizeHtml(value, strippedTextOptions)
        .replace(/[<>"'`]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}
const cleanString = (maxLength) => z.string().transform(sanitizeString).pipe(z.string().min(1).max(maxLength));
const optionalCleanString = (maxLength) => z.string().transform(sanitizeString).pipe(z.string().max(maxLength)).optional();
export const invoiceCreateSchema = z.object({
    amount: z.coerce.number().positive().max(10_000_000),
    due: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    buyer: cleanString(160),
    number: optionalCleanString(80),
    discount: z.coerce.number().min(1).max(30),
    seller: cleanString(120),
    notes: optionalCleanString(600),
}).strict();
export const invoiceActionQuerySchema = z.object({
    id: cleanString(100),
    action: z.enum(["fund", "repay"]),
}).strict();
export const fundInvoiceSchema = z.object({
    funder: cleanString(120),
    investorWalletAddress: cleanString(120).optional(),
    invoiceId: cleanString(100).optional(),
    dealId: cleanString(100).optional(),
    amount: z.coerce.number().positive().max(10_000_000).optional(),
    amountUSD: z.coerce.number().positive().max(10_000_000).optional(),
    destinationWallet: cleanString(120).optional(),
    provider: z.enum(["freighter", "albedo", "phyto", "demo"]).optional(),
}).strict();
export const confirmFundInvoiceSchema = fundInvoiceSchema.extend({
    signedXdr: z.string().min(1).optional(),
    txHash: cleanString(120),
});
export const emptyBodySchema = z.object({}).strict();
export const parseInvoiceSchema = z.object({
    fileBase64: z.string().min(1).max(7_000_000),
    mimeType: z.enum(["application/pdf", "image/png", "image/jpeg", "image/webp"]),
}).strict();
const PAGE_VALUES = ["dashboard", "simulation", "marketplace", "deal", "activity", "upload", "portfolio", "landing"];
const STEP_VALUES = ["upload", "parsing", "review", "funding", "repayment"];
export const chatSchema = z.object({
    question: z.string().transform(v => v ? sanitizeString(v) : v).pipe(z.string().max(1000)).optional().default(""),
    walletAddress: optionalCleanString(120).nullable(),
    view: optionalCleanString(40).nullable(),
    history: z.array(z.object({
        role: z.enum(["assistant", "user"]),
        text: z.string().transform(sanitizeString).pipe(z.string().min(1).max(2000)),
    }).strict()).max(20).optional().default([]),
    page: z.enum(PAGE_VALUES).optional().nullable(),
    step: z.enum(STEP_VALUES).optional().nullable(),
    data: z.record(z.union([z.string(), z.number(), z.boolean()])).optional().nullable(),
}).strict();
export const visitorSchema = z.object({
    id: optionalCleanString(100),
    userAgent: optionalCleanString(300),
    language: optionalCleanString(80),
    platform: optionalCleanString(120),
}).strict();
export const aiInvoiceResultSchema = z.object({
    amount: z.coerce.number().positive().max(10_000_000),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    buyerName: cleanString(160),
    invoiceNumber: cleanString(80),
    summary: cleanString(600),
}).strict();
export const aiAssistantResultSchema = z.object({
    answer: cleanString(2000),
}).strict();
// Wallet authentication schemas
export const addressSchema = z.object({
    address: z.string().regex(/^G[A-Z0-9]{55}$/, "Invalid Stellar address format"),
}).strict();
export const signatureSchema = z.object({
    address: z.string().regex(/^G[A-Z0-9]{55}$/, "Invalid Stellar address format"),
    signature: z.string().min(1).max(1000),
    nonce: z.string().min(10).max(100),
}).strict();
