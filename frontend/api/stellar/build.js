import { buildFundInvoiceTransaction, jsonError } from "../../../backend/service";
export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed." });
        return;
    }
    try {
        const result = await buildFundInvoiceTransaction({
            invoiceId: String(req.body?.invoiceId || req.body?.dealId || ""),
            dealId: req.body?.dealId ? String(req.body.dealId) : undefined,
            investorWalletAddress: String(req.body?.investorPublicKey || req.body?.investorWalletAddress || ""),
            amountUSD: Number(req.body?.amountUSD || 0),
            destinationWallet: req.body?.destinationWallet ? String(req.body.destinationWallet) : undefined,
        });
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json(jsonError(error));
    }
}
