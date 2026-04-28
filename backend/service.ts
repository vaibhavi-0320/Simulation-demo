import { GoogleGenAI, Type } from "@google/genai";
import * as StellarSdk from "stellar-sdk";
import { HttpError } from "./errors";
import { getStore, persistStore } from "./store";
import { InvoiceRecord, TransactionRecord, VisitorRecord } from "./types";

const HORIZON_TESTNET_URL = "https://horizon-testnet.stellar.org";
const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
const USD_PER_XLM = Number(process.env.USD_PER_XLM || 25);
const horizonServer = new StellarSdk.Horizon.Server(HORIZON_TESTNET_URL);

function now() {
  return new Date().toISOString();
}

function asCurrency(value: number) {
  return `$${value.toLocaleString()}`;
}

function asXlm(value: number) {
  return `${Math.ceil(value / 25)} XLM`;
}

function toXlmAmount(amountUSD: number) {
  const amount = amountUSD / USD_PER_XLM;
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new HttpError(400, "Funding amount must be greater than zero.");
  }
  return amount.toFixed(7).replace(/\.?0+$/, "");
}

function isValidPublicKey(value?: string) {
  return Boolean(value && StellarSdk.StrKey.isValidEd25519PublicKey(value));
}

function horizonDetails(error: any) {
  return {
    message: error?.message,
    status: error?.response?.status,
    title: error?.response?.data?.title,
    detail: error?.response?.data?.detail,
    extras: error?.response?.data?.extras,
  };
}

function mapHorizonError(error: any, fallback = "Stellar transaction failed.") {
  const codes = error?.response?.data?.extras?.result_codes;
  const txCode = codes?.transaction;
  const opCode = Array.isArray(codes?.operations) ? codes.operations[0] : undefined;

  if (error?.response?.status === 404) return "Stellar account not found on testnet.";
  if (txCode === "tx_bad_seq") return "Bad sequence. Refresh the page and try again.";
  if (opCode === "op_underfunded" || txCode === "tx_insufficient_balance") return "Wallet has insufficient XLM for this payment and network fee.";
  if (opCode === "op_no_destination") return "Funding destination account does not exist on Stellar testnet.";
  if (opCode === "op_malformed") return "Stellar payment operation is malformed.";
  if (opCode === "op_no_trust") return "Destination is missing the required trustline.";
  return error?.response?.data?.detail || error?.message || fallback;
}

function resolveFundingDestination(invoice?: InvoiceRecord, destinationWallet?: string) {
  const candidates = [
    destinationWallet,
    invoice?.fundingWallet,
    invoice?.escrowWallet,
    invoice?.seller,
    process.env.FINTRIX_ESCROW_ADDRESS,
  ];
  return candidates.find((candidate) => isValidPublicKey(candidate));
}

function buildInvoice(input: { amount: number; due: string; buyer: string; number?: string; discount: number; seller: string; notes?: string }) {
  const amount = Number(input.amount);
  const discount = Number(input.discount || 7);
  return {
    id: input.number || `INV-${Date.now()}`,
    buyer: input.buyer.trim(),
    amount,
    discount,
    due: input.due,
    status: "active" as const,
    seller: input.seller,
    yield: Number((discount + (amount >= 50000 ? 1.4 : 0.8)).toFixed(1)),
    funded: 0,
    tags: ["AI Screened", discount >= 10 ? "High Yield" : "Prime"],
    riskScore: Math.min(92, Math.max(18, Math.round(discount * 4 + (amount >= 50000 ? 12 : 4)))),
    aiSummary: input.notes?.trim() || "Invoice parsed and approved for simulated marketplace funding.",
  };
}

export function listInvoices() {
  return getStore().invoices;
}

export function listTransactions() {
  return getStore().transactions;
}

export function listVisitors() {
  return getStore().visitors;
}

export function trackVisitor(input: { id?: string; userAgent?: string; language?: string; platform?: string }) {
  const store = getStore();
  const normalizedId = String(input.id || "").trim() || `anon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const existing = store.visitors.find((visitor) => visitor.id === normalizedId);

  if (existing) {
    existing.lastSeenAt = now();
    existing.visits += 1;
    existing.userAgent = input.userAgent || existing.userAgent;
    existing.language = input.language || existing.language;
    existing.platform = input.platform || existing.platform;
    persistStore();
    return existing;
  }

  const created: VisitorRecord = {
    id: normalizedId,
    firstSeenAt: now(),
    lastSeenAt: now(),
    visits: 1,
    userAgent: input.userAgent,
    language: input.language,
    platform: input.platform,
  };
  store.visitors.unshift(created);
  persistStore();
  return created;
}

export function createInvoice(input: { amount: number; due: string; buyer: string; number?: string; discount: number; seller: string; notes?: string }) {
  if (!input.amount || !input.due || !input.buyer) {
    throw new Error("Amount, due date, and buyer are required.");
  }

  const store = getStore();
  const invoice = buildInvoice(input);
  store.invoices.unshift(invoice);
  store.transactions.unshift({
    type: "List",
    name: `Invoice ${invoice.id} - ${invoice.buyer}`,
    amount: asCurrency(invoice.amount),
    xlm: "-",
    status: "Success",
    time: now(),
  });
  persistStore();
  return invoice;
}

export function fundInvoice(id: string, funder: string) {
  const store = getStore();
  const invoice = store.invoices.find((item) => item.id === id);
  if (!invoice) throw new Error("Invoice not found.");
  if (invoice.status !== "active") throw new Error("Invoice is not available for funding.");

  invoice.status = "funded";
  invoice.funded = invoice.amount;
  invoice.funder = funder;
  store.transactions.unshift({
    type: "Fund",
    name: `Invoice ${invoice.id} - ${invoice.buyer}`,
    amount: asCurrency(invoice.amount),
    xlm: asXlm(invoice.amount),
    status: "Success",
    time: now(),
  });
  persistStore();
  return invoice;
}

export async function buildFundInvoiceTransaction(input: {
  invoiceId: string;
  dealId?: string;
  investorWalletAddress: string;
  amountUSD: number;
  destinationWallet?: string;
}) {
  const store = getStore();
  const invoice = store.invoices.find((item) => item.id === input.invoiceId || item.id === input.dealId);
  const source = input.investorWalletAddress?.trim();
  const destination = resolveFundingDestination(invoice, input.destinationWallet);
  const amountXLM = toXlmAmount(input.amountUSD);

  if (!isValidPublicKey(source)) {
    throw new HttpError(400, "Investor wallet address is missing or invalid.");
  }
  if (!destination) {
    throw new HttpError(400, "Funding destination wallet is missing or invalid for this invoice.");
  }
  if (invoice && invoice.status !== "active") {
    throw new HttpError(400, "Invoice is not available for funding.");
  }

  try {
    let sourceAccount: any;
    try {
      sourceAccount = await horizonServer.loadAccount(source);
    } catch (error: any) {
      throw new HttpError(400, mapHorizonError(error, "Investor wallet is not activated on Stellar testnet."));
    }

    try {
      await horizonServer.loadAccount(destination);
    } catch {
      throw new HttpError(400, "Destination wallet not activated on Stellar testnet.");
    }

    const nativeBalance = Number(sourceAccount.balances.find((balance: any) => balance.asset_type === "native")?.balance || 0);
    if (nativeBalance < Number(amountXLM) + 1) {
      throw new HttpError(400, "Wallet has insufficient testnet XLM for this funding amount and fee.");
    }

    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(StellarSdk.Operation.payment({
        destination,
        asset: StellarSdk.Asset.native(),
        amount: amountXLM,
      }))
      .addMemo(StellarSdk.Memo.text(`Fintrix ${input.invoiceId}`.slice(0, 28)))
      .setTimeout(180)
      .build();

    return {
      xdr: transaction.toXDR(),
      invoiceId: input.invoiceId,
      dealId: input.dealId,
      investorWalletAddress: source,
      destinationWallet: destination,
      amountUSD: input.amountUSD,
      amountXLM,
      asset: "XLM",
      networkPassphrase: NETWORK_PASSPHRASE,
      horizonUrl: HORIZON_TESTNET_URL,
    };
  } catch (error: any) {
    console.error("[Fintrix fund-invoice] Stellar SDK error", JSON.stringify(horizonDetails(error), null, 2));
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, mapHorizonError(error, "Unable to build Stellar funding transaction."));
  }
}

export function confirmFundInvoice(input: {
  invoiceId: string;
  investorWalletAddress: string;
  amountUSD: number;
  txHash: string;
}) {
  const store = getStore();
  const invoice = store.invoices.find((item) => item.id === input.invoiceId);
  if (!invoice) throw new HttpError(404, "Invoice not found.");
  if (invoice.status !== "active") throw new HttpError(400, "Invoice is not available for funding.");

  invoice.status = "funded";
  invoice.funded = input.amountUSD;
  invoice.funder = input.investorWalletAddress;
  invoice.txHash = input.txHash;
  store.transactions.unshift({
    type: "Fund",
    name: `Invoice ${invoice.id} - ${invoice.buyer}`,
    amount: asCurrency(input.amountUSD),
    xlm: `${toXlmAmount(input.amountUSD)} XLM`,
    status: "Success",
    time: now(),
  });
  persistStore();
  return invoice;
}

export function repayInvoice(id: string) {
  const store = getStore();
  const invoice = store.invoices.find((item) => item.id === id);
  if (!invoice) throw new Error("Invoice not found.");
  if (invoice.status !== "funded") throw new Error("Invoice must be funded before repayment.");

  invoice.status = "repaid";
  store.transactions.unshift({
    type: "Repay",
    name: `Invoice ${invoice.id} - ${invoice.buyer}`,
    amount: asCurrency(invoice.amount + invoice.amount * (invoice.yield / 100)),
    xlm: asXlm(invoice.amount + invoice.amount * (invoice.yield / 100)),
    status: "Success",
    time: now(),
  });
  persistStore();
  return invoice;
}

function fallbackParse(fileBase64: string) {
  return {
    amount: 25000,
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
    buyerName: "Parsed Buyer",
    invoiceNumber: `INV-${Date.now()}`,
    summary: `Fallback parser used for payload length ${fileBase64.length}.`,
  };
}

export async function parseInvoice(fileBase64: string, mimeType: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return fallbackParse(fileBase64);
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        parts: [
          { inlineData: { data: fileBase64.split(",")[1] || fileBase64, mimeType } },
          { text: "Extract invoice amount, due date (YYYY-MM-DD), buyer name, invoice number, and a one-sentence financing summary. Return JSON only." },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          amount: { type: Type.NUMBER },
          dueDate: { type: Type.STRING },
          buyerName: { type: Type.STRING },
          invoiceNumber: { type: Type.STRING },
          summary: { type: Type.STRING },
        },
        required: ["amount", "dueDate", "buyerName", "invoiceNumber", "summary"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

const FINTRIX_ASSISTANT_SYSTEM_PROMPT =
  "You are the Fintrix AI Assistant — an expert on the Fintrix invoice financing platform. Fintrix helps SMEs (small and medium businesses) convert unpaid invoices into immediate working capital by connecting them with investors on a Stellar blockchain-powered marketplace. You help users understand how to upload invoices, how the Trust Score system works, how investors can browse and fund deals, how Stellar wallet integration works, and anything else related to Fintrix. Be concise, professional, and helpful. If a question is unrelated to Fintrix or finance, politely redirect the user.";

function buildAssistantFallback(question: string, walletAddress?: string, view?: string) {
  const store = getStore();
  const lower = question.toLowerCase();
  const funded = store.invoices.filter((invoice) => invoice.status === "funded").length;
  const active = store.invoices.filter((invoice) => invoice.status === "active").length;
  const repaid = store.invoices.filter((invoice) => invoice.status === "repaid").length;

  if (lower.includes("freighter") || lower.includes("wallet") || lower.includes("connect")) {
    return `To connect Freighter, unlock the extension, approve this site, and use the Connect Wallet button. For Albedo in this MVP, paste the public Stellar address. Current view: ${view || "app"}.`;
  }

  if (lower.includes("market") || lower.includes("invoice") || lower.includes("fund")) {
    return `The marketplace currently has ${active} active invoices, ${funded} funded invoices, and ${repaid} repaid invoices. To fund an invoice, connect a wallet first, open Marketplace, and click Fund Invoice on an active listing.`;
  }

  if (lower.includes("portfolio") || lower.includes("balance")) {
    return walletAddress
      ? `Your connected wallet is ${walletAddress}. The portfolio page shows the wallet address, fetched XLM balance, and any related invoices tied to that wallet session.`
      : "Connect a wallet first, then open Portfolio to see the wallet address, XLM balance, and invoice exposure tied to that session.";
  }

  if (lower.includes("repay") || lower.includes("activity") || lower.includes("history")) {
    return `The Activity page shows listing, funding, and repayment events from the backend store. If an invoice is funded, the repayment trigger appears there so you can complete the simulation loop.`;
  }

  if (lower.includes("create") || lower.includes("upload") || lower.includes("ai")) {
    return "Use Create Simulation to upload a PDF or PNG invoice, let AI prefill the draft when available, review the buyer, amount, and due date, then submit it to the live marketplace.";
  }

  return "Fintrix helps SMEs turn unpaid invoices into immediate working capital through a Stellar-powered investor marketplace. Ask about invoice uploads, Trust Scores, wallet setup, investor funding, or repayment workflows.";
}

export async function askAssistant(input: {
  question: string;
  walletAddress?: string;
  view?: string;
  history?: Array<{ role: "assistant" | "user"; text: string }>;
}) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  
  if (!anthropicKey && !geminiKey) {
    return { answer: buildAssistantFallback(input.question, input.walletAddress, input.view) };
  }

  const store = getStore();
  const context = `Current view: ${input.view || "unknown"}\nConnected wallet: ${input.walletAddress || "none"}\nInvoices in store: ${store.invoices.length}`;
  const history = (input.history || []).slice(-12);

  if (anthropicKey) {
    // FIXED: Bug 2 — use Anthropic Claude API as preferred
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 500,
        system: FINTRIX_ASSISTANT_SYSTEM_PROMPT,
        messages: [
          ...history.map((message) => ({
            role: message.role,
            content: message.text,
          })),
          { role: "user", content: `${context}\n\nUser: ${input.question}` }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }
    const data = await response.json();
    return { answer: data.content[0].text };
  } else if (geminiKey) {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const transcript = history
      .map((message) => `${message.role === "assistant" ? "Assistant" : "User"}: ${message.text}`)
      .join("\n");
    const prompt = [
      FINTRIX_ASSISTANT_SYSTEM_PROMPT,
      context,
      transcript ? `Conversation so far:\n${transcript}` : "",
      `User: ${input.question}`,
    ].filter(Boolean).join("\n\n");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [{ text: prompt }] }],
    });

    return { answer: response.text || buildAssistantFallback(input.question, input.walletAddress, input.view) };
  }
}
export function jsonError(error: unknown) {
  return { error: error instanceof Error ? error.message : "Unexpected error." };
}

