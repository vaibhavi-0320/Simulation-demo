import { buildMainApiUrl } from "./mainApi";
function buildLocalAssistantFallback(question, view, walletAddress) {
    const lower = question.toLowerCase();
    if (lower.includes("upload") || lower.includes("invoice")) {
        return "To upload an invoice in Fintrix, open Simulation, enter the invoice details, continue to AI parsing, review the draft, and submit it to the marketplace.";
    }
    if (lower.includes("trust score") || lower.includes("risk")) {
        return "The Trust Score is Fintrix's invoice risk signal. It reflects factors like buyer quality, repayment horizon, invoice size, and overall deal strength so investors can compare opportunities quickly.";
    }
    if (lower.includes("wallet") || lower.includes("freighter") || lower.includes("albedo")) {
        return walletAddress
            ? `Your wallet ${walletAddress} is connected. Freighter supports extension-based signing, and Albedo supports web-based signing for Stellar.`
            : "Use Connect Wallet to link Freighter or Albedo. Freighter is the main Stellar extension flow, while Albedo works through a web signing popup.";
    }
    if (lower.includes("fund") || lower.includes("marketplace") || lower.includes("invest")) {
        return "Investors can browse invoice deals in Marketplace, review the APY and Trust Score, open a deal, and fund it after approving the Stellar wallet transaction.";
    }
    if (lower.includes("repay") || lower.includes("returns") || lower.includes("yield")) {
        return "When an invoice matures and is repaid, the investor receives principal plus the quoted yield. Returns depend on the APY and the invoice duration.";
    }
    return `Fintrix is an AI-assisted invoice financing platform on Stellar. I can help with invoice uploads, Trust Scores, wallet setup, funding flows, and repayments. Current context: ${view}.`;
}
function fallbackParse(fileBase64) {
    const payload = fileBase64.split(",")[1] || "";
    let decoded = "";
    try {
        decoded = atob(payload.slice(0, 512));
    }
    catch {
        decoded = "";
    }
    const text = decoded.replace(/[^\w\s:/.-]/g, " ");
    const amountMatch = text.match(/(\d[\d,]+(?:\.\d{1,2})?)/);
    const dateMatch = text.match(/(20\d{2}-\d{2}-\d{2})/);
    const invoiceMatch = text.match(/(INV[-\s]?\d[\w-]*)/i);
    return {
        amount: amountMatch ? Number(amountMatch[1].replace(/,/g, "")) : 25000,
        dueDate: dateMatch?.[1] || new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
        buyerName: "Parsed Buyer",
        invoiceNumber: invoiceMatch?.[1] || `INV-${Date.now()}`,
        summary: "Fallback parser used because the AI endpoint is unavailable.",
    };
}
export async function parseInvoiceWithAI(fileBase64, mimeType) {
    try {
        const response = await fetch(buildMainApiUrl("ai-parse"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileBase64, mimeType }),
        });
        if (!response.ok) {
            throw new Error("AI parse failed");
        }
        return (await response.json());
    }
    catch (error) {
        console.warn("Using fallback invoice parser", error);
        return fallbackParse(fileBase64);
    }
}
export async function askFintrixAssistant(input) {
    try {
        const response = await fetch(buildMainApiUrl("chat"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                question: input.question,
                view: input.view,
                walletAddress: input.walletAddress ?? null,
                history: input.history ?? [],
            }),
        });
        if (!response.ok) {
            throw new Error("Chat request failed");
        }
        const parsed = await response.json();
        if (parsed?.success && parsed?.data?.answer) {
            return { answer: parsed.data.answer };
        }
        if (parsed?.answer) {
            return { answer: parsed.answer };
        }
        throw new Error("Missing assistant answer");
    }
    catch (error) {
        console.warn("Using local assistant fallback", error);
        return {
            answer: buildLocalAssistantFallback(input.question, input.view, input.walletAddress ?? null),
        };
    }
}
