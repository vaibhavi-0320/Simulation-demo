import * as StellarSdk from "stellar-sdk";
import { getAddress, getNetworkDetails, isAllowed, isConnected, requestAccess, signTransaction } from "@stellar/freighter-api";
import { ConnectedWallet, Invoice, Transaction, WalletProvider } from "../types";
import { getUserStorageKey, safeStorage } from "../utils/storage";
import { buildMainApiUrl } from "./mainApi";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const PASSPHRASE = "Test SDF Network ; September 2015";
const API = import.meta.env.VITE_API_BASE || "";
const horizonServer = new StellarSdk.Horizon.Server(HORIZON_URL);

export function validatePublicKey(publicKey: string) {
  return StellarSdk.StrKey.isValidEd25519PublicKey(publicKey.trim());
}

export async function connectFreighterWallet(): Promise<ConnectedWallet> {
  const status = await isConnected();
  if (status.error && !status.isConnected) {
    throw new Error(status.error.message);
  }

  const permission = await isAllowed();
  if (permission.error) {
    throw new Error(permission.error.message);
  }

  const access = permission.isAllowed ? await getAddress() : await requestAccess();
  if (access.error && !access.address) {
    const fallbackAddress = await getAddress();
    if (fallbackAddress.error || !fallbackAddress.address) {
      throw new Error(
        access.error.message ||
        fallbackAddress.error?.message ||
        "Freighter is installed but did not provide an address. Unlock the extension, allow this site, and try again."
      );
    }
    return {
      publicKey: fallbackAddress.address,
      provider: "freighter",
      label: "Freighter",
    };
  }

  const fallback = !access.address ? await getAddress() : access;
  if (fallback.error || !fallback.address) {
    throw new Error(
      fallback.error?.message ||
      "Freighter is installed but did not return an address. Re-open Freighter, approve this site, and try again."
    );
  }

  return {
    publicKey: fallback.address,
    provider: "freighter",
    label: "Freighter",
  };
}

export async function connectManualWallet(provider: WalletProvider, publicKey?: string): Promise<ConnectedWallet> {
  if (provider === "demo") {
    return {
      publicKey: StellarSdk.Keypair.random().publicKey(),
      provider,
      label: "Demo Wallet",
    };
  }

  if (!publicKey || !validatePublicKey(publicKey)) {
    throw new Error("Enter a valid Stellar public key.");
  }

  return {
    publicKey: publicKey.trim(),
    provider,
    label: provider === "albedo" ? "Albedo" : "Phyto Wallet",
  };
}

export async function getAccountBalance(publicKey: string) {
  try {
    const account = await horizonServer.loadAccount(publicKey);
    const nativeBalance = account.balances.find((balance) => balance.asset_type === "native");
    return nativeBalance ? Number(nativeBalance.balance) : 0;
  } catch (error) {
    console.warn("Unable to fetch Horizon balance", error);
    return 0;
  }
}

export async function getNetworkSummary() {
  try {
    const details = await getNetworkDetails();
    if (details.error) {
      return { network: "Stellar Testnet", sorobanRpcUrl: "Configured externally" };
    }

    return {
      network: details.network || "Stellar Testnet",
      sorobanRpcUrl: details.sorobanRpcUrl || "Configured externally",
    };
  } catch {
    return { network: "Stellar Testnet", sorobanRpcUrl: "Configured externally" };
  }
}

const SEED_INVOICES: Invoice[] = [
  { id: "#INV-4921", buyer: "TechLogistics Ltd", amount: 45000, discount: 8, due: "2026-10-24", status: "funded", seller: "demo", yield: 8.2, riskScore: 18, funded: 45000, tags: ["logistics", "uk"], aiSummary: "Tier-1 supplier", companyName: "TechLogistics Ltd", industry: "Logistics & Supply Chain", country: "India" },
  { id: "#INV-4922", buyer: "Quantum Global", amount: 12800, discount: 9.5, due: "2026-11-02", status: "active", seller: "demo", yield: 9.5, riskScore: 35, funded: 0, tags: ["tech"], aiSummary: "SaaS provider", companyName: "Quantum Global", industry: "Technology & Software", country: "Singapore" },
  { id: "#INV-4925", buyer: "Arcane Systems", amount: 2450, discount: 7.8, due: "2026-10-29", status: "funded", seller: "demo", yield: 7.8, riskScore: 22, funded: 2450, tags: ["hardware"], aiSummary: "Hardware manufacturer", companyName: "Arcane Systems", industry: "Defense & Aerospace", country: "United Kingdom" },
];

function getLocalInvoices(): Invoice[] {
  const stored = safeStorage.get<Invoice[]>("invoices", []);
  if (!stored.length) {
    safeStorage.set("invoices", SEED_INVOICES);
    return SEED_INVOICES;
  }

  const parsed = stored;
  const needsRefresh = parsed.some((invoice) => invoice.id?.startsWith("#INV-492") && !invoice.companyName);
  if (needsRefresh) {
    const merged = SEED_INVOICES.map((seed) => {
      const existing = parsed.find((invoice) => invoice.id === seed.id);
      return existing
        ? {
            ...seed,
            ...existing,
            companyName: existing.companyName || seed.companyName,
            industry: existing.industry || seed.industry,
            country: existing.country || seed.country,
          }
        : seed;
    });
    const userInvoices = parsed.filter((invoice) => !SEED_INVOICES.some((seed) => seed.id === invoice.id));
    const all = [...merged, ...userInvoices];
    safeStorage.set("invoices", all);
    return all;
  }

  return parsed;
}

function setLocalInvoices(invoices: Invoice[]) {
  safeStorage.set("invoices", invoices);
}

export async function getInvoices(): Promise<Invoice[]> {
  await new Promise((res) => setTimeout(res, 300));
  return getLocalInvoices();
}

export async function createInvoice(payload: {
  amount: number;
  due: string;
  buyer: string;
  number?: string;
  discount: number;
  seller: string;
  notes?: string;
  companyName?: string;
  industry?: string;
  country?: string;
}): Promise<Invoice> {
  await new Promise((res) => setTimeout(res, 800));
  const newInvoice: Invoice = {
    id: payload.number || `#INV-${Math.floor(Math.random() * 10000)}`,
    buyer: payload.buyer,
    amount: payload.amount,
    discount: payload.discount,
    due: payload.due,
    status: "active",
    seller: payload.seller,
    yield: payload.discount,
    riskScore: Math.floor(Math.random() * 30) + 10,
    funded: 0,
    tags: ["new", "simulation"],
    aiSummary: payload.notes?.trim() || "",
    companyName: payload.companyName?.trim() || payload.buyer || "",
    industry: payload.industry?.trim() || "",
    country: payload.country?.trim() || "",
  };
  const current = getLocalInvoices();
  setLocalInvoices([newInvoice, ...current]);
  return newInvoice;
}

export async function fundInvoice(
  invoiceId: string,
  amountUSD: number,
  deal: { company?: string; apy?: number; repaymentDate?: string }
) {
  const connected = await isConnected();
  if (!connected || !connected.isConnected) {
    throw new Error('Freighter is not connected. Click "Connect Wallet" first.');
  }

  const addrResult = await getAddress();
  const investorPublicKey = addrResult?.address;

  if (!investorPublicKey || investorPublicKey.length !== 56) {
    throw new Error(`Invalid wallet address from Freighter: "${investorPublicKey}"`);
  }

  const buildRes = await fetch(`${API}${buildMainApiUrl("stellar-build")}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      investorPublicKey,
      amountUSD: Number(amountUSD),
      invoiceId: String(invoiceId),
    }),
  });

  const buildData = await buildRes.json();

  if (!buildRes.ok) {
    throw new Error(buildData.error || `Build failed with status ${buildRes.status}`);
  }

  const { xdr } = buildData;

  // Before signing — verify XDR is valid
  if (!xdr || typeof xdr !== 'string' || xdr.length < 100) {
    throw new Error(
      `Invalid XDR received from server: "${String(xdr).substring(0, 50)}". ` +
      `This usually means the API call failed and returned HTML instead of JSON.`
    );
  }

  let signedXdr: string;
  try {
    const signResult = await signTransaction(xdr, {
      networkPassphrase: PASSPHRASE,
    });

    // Handle all possible Freighter response shapes
    signedXdr = (signResult as any)?.signedTxXdr 
      || (signResult as any)?.xdr
      || (signResult as any)?.signed_envelope_xdr
      || (typeof signResult === 'string' ? signResult : '');

    if (!signedXdr || signedXdr.length < 100) {
      throw new Error(
        'Freighter returned empty signed transaction. ' +
        'Make sure Freighter is unlocked, set to Testnet network, ' +
        'and you approved the transaction popup.'
      );
    }
  } catch (error: any) {
    const msg = error?.message || String(error);
    if (msg.toLowerCase().includes("decli") || msg.toLowerCase().includes("reject") || msg.toLowerCase().includes("cancel")) {
      throw new Error("You cancelled the transaction in Freighter.");
    }
    if (msg.includes('empty') || msg.includes('undefined')) {
      throw new Error(
        'Freighter did not return a signed transaction. ' +
        'Check that: 1) Freighter is set to TESTNET network, ' +
        '2) You clicked Approve (not Decline), ' +
        '3) Your wallet has enough XLM for fees.'
      );
    }
    throw new Error(`Freighter signing error: ${msg}`);
  }

  const submitRes = await fetch(`${API}${buildMainApiUrl("stellar-submit")}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      signedXdr,
      invoiceId,
      amountUSD,
      company: deal.company,
      apy: deal.apy,
      repaymentDate: deal.repaymentDate,
    }),
  });

  const submitData = await submitRes.json();

  if (!submitRes.ok) {
    throw new Error(submitData.error || `Submit failed with status ${submitRes.status}`);
  }

  try {
    const portfolioEntry = {
      txHash: submitData.txHash,
      explorerUrl: submitData.explorerUrl,
      invoiceId,
      company: deal.company || "Unknown",
      amountUSD: Number(amountUSD),
      amountXLM: parseFloat(buildData.xlmAmount),
      apy: deal.apy || 0,
      APY: deal.apy || 0,
      fundedAt: new Date().toISOString(),
      maturityDate: deal.repaymentDate || null,
      status: "active",
      type: "investment",
    };

    safeStorage.append(getUserStorageKey(investorPublicKey, "portfolio"), portfolioEntry, 100);
    safeStorage.append(getUserStorageKey(investorPublicKey, "activity"), {
      type: "funded",
      label: `Funded ${deal.company || "Unknown"} invoice`,
      amount: `$${Number(amountUSD).toLocaleString()}`,
      txHash: submitData.txHash,
      timestamp: new Date().toISOString(),
    }, 50);
  } catch {
    // Non-fatal: chain confirmation is the source of truth for this action.
  }

  return {
    success: true,
    txHash: submitData.txHash,
    explorerUrl: submitData.explorerUrl,
  };
}

export async function simulateOnTestnet(
  amountUSD: number,
  deal: { id: string; company?: string; apy?: number; durationDays?: number; repaymentDate?: string }
) {
  const connected = await isConnected();
  if (!connected?.isConnected) {
    throw new Error("Freighter not connected. Please connect your wallet first.");
  }

  const addrResult = await getAddress();
  const investorPublicKey = addrResult?.address;
  if (!investorPublicKey || investorPublicKey.length !== 56) {
    throw new Error("Invalid wallet address from Freighter.");
  }

  const buildRes = await fetch(`${API}${buildMainApiUrl("stellar-build-simulation")}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      investorPublicKey,
      amountUSD: Number(amountUSD),
      invoiceId: deal.id,
      dealId: deal.id,
    }),
  });

  const buildData = await buildRes.json();
  if (!buildRes.ok) {
    throw new Error(buildData.error || "Failed to build simulation");
  }

  const { xdr } = buildData;

  // Before signing — verify XDR is valid
  if (!xdr || typeof xdr !== 'string' || xdr.length < 100) {
    throw new Error(
      `Invalid XDR received from server: "${String(xdr).substring(0, 50)}". ` +
      `This usually means the API call failed and returned HTML instead of JSON.`
    );
  }

  let signedXdr: string;
  try {
    const signResult = await signTransaction(xdr, {
      networkPassphrase: PASSPHRASE,
    });

    // Handle all possible Freighter response shapes
    signedXdr = (signResult as any)?.signedTxXdr 
      || (signResult as any)?.xdr
      || (signResult as any)?.signed_envelope_xdr
      || (typeof signResult === 'string' ? signResult : '');

    if (!signedXdr || signedXdr.length < 100) {
      throw new Error(
        'Freighter returned empty signed transaction. ' +
        'Make sure Freighter is unlocked, set to Testnet network, ' +
        'and you approved the transaction popup.'
      );
    }
  } catch (error: any) {
    const msg = error?.message || String(error);
    if (msg.toLowerCase().includes("decli") || msg.toLowerCase().includes("cancel") || msg.toLowerCase().includes("reject")) {
      throw new Error("Simulation cancelled in Freighter.");
    }
    if (msg.includes('empty') || msg.includes('undefined')) {
      throw new Error(
        'Freighter did not return a signed transaction. ' +
        'Check that: 1) Freighter is set to TESTNET network, ' +
        '2) You clicked Approve (not Decline), ' +
        '3) Your wallet has at least 2 XLM for fees.'
      );
    }
    throw new Error(`Freighter signing failed: ${msg}`);
  }

  const submitRes = await fetch(`${API}${buildMainApiUrl("stellar-submit")}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signedXdr, invoiceId: deal.id, amountUSD }),
  });

  const submitData = await submitRes.json();
  if (!submitRes.ok) {
    throw new Error(submitData.error || "Simulation submission failed");
  }

  // CHECK THAT txHash EXISTS before calling substring()
  if (!submitData.txHash || typeof submitData.txHash !== 'string') {
    throw new Error(
      'Simulation was submitted but server returned invalid transaction hash. ' +
      'This is a server error. Please try again.'
    );
  }

  const realSimId = `SIM-${submitData.txHash.substring(0, 8).toUpperCase()}`;
  const expectedReturn = parseFloat(
    (amountUSD * ((deal.apy || 0) / 100) * ((deal.durationDays || 180) / 365)).toFixed(2)
  );
  const maturityDate = deal.repaymentDate ||
    new Date(Date.now() + (deal.durationDays || 180) * 86400000).toISOString().split("T")[0];

  const simRecord = {
    simId: realSimId,
    txHash: submitData.txHash,
    explorerUrl: submitData.explorerUrl,
    invoiceId: deal.id,
    company: deal.company || "Unknown",
    amountUSD,
    expectedReturn,
    maturityDate,
    simulatedAt: new Date().toISOString(),
    onChain: true,
  };

  try {
    safeStorage.append(getUserStorageKey(investorPublicKey, "simulations"), simRecord, 100);
    safeStorage.append(getUserStorageKey(investorPublicKey, "activity"), {
      type: "simulation",
      label: `Simulated ${deal.company || "Unknown"} return`,
      amount: `$${Number(amountUSD).toLocaleString()}`,
      txHash: submitData.txHash,
      timestamp: new Date().toISOString(),
    }, 50);
  } catch {
    // Best-effort local caching only.
  }

  return simRecord;
}

export async function fundInvoiceOnBackend(invoiceId: string, funder: string, provider: WalletProvider, amountUSD?: number): Promise<Invoice> {
  const current = getLocalInvoices();
  const invoice = current.find((item) => item.id === invoiceId);
  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (provider !== "freighter") {
    throw new Error("Real testnet funding requires a connected Freighter wallet.");
  }

  const fundingAmountUSD = amountUSD || invoice.amount;
  const investorPublicKey = funder;
  const result = await fundInvoice(invoiceId, fundingAmountUSD, {
    company: invoice.companyName || invoice.buyer,
    apy: invoice.yield,
    repaymentDate: invoice.due,
  });

  invoice.status = "funded";
  invoice.funder = investorPublicKey;
  invoice.funded = fundingAmountUSD;
  invoice.txHash = result.txHash;
  setLocalInvoices(current);

  return invoice;
}

export async function repayInvoiceOnBackend(invoiceId: string): Promise<Invoice> {
  const current = getLocalInvoices();
  const invoice = current.find((item) => item.id === invoiceId);
  if (!invoice) {
    throw new Error("Invoice not found");
  }

  invoice.status = "repaid";
  setLocalInvoices(current);
  return invoice;
}

export async function getTransactions(): Promise<Transaction[]> {
  return [];
}

export async function buildSorobanEscrowPreview(invoiceId: string, amount: number) {
  await new Promise((resolve) => setTimeout(resolve, 900));
  return {
    invoiceId,
    amount,
    settlementAsset: "XLM",
    contractAction: "fund_invoice",
    sorobanPattern: "create -> fund -> repay",
  };
}

export async function confirmFreighterAction() {
  const status = await isConnected();
  if (status.error || !status.isConnected) {
    throw new Error("Freighter extension not detected. Install/open Freighter first.");
  }

  const permission = await isAllowed();
  if (permission.error) {
    throw new Error(permission.error.message);
  }

  if (!permission.isAllowed) {
    const access = await requestAccess();
    if (access.error) {
      throw new Error(access.error.message || "Freighter confirmation was rejected.");
    }
  }

  const address = await getAddress();
  if (address.error || !address.address) {
    throw new Error(address.error?.message || "Unable to confirm Freighter session.");
  }

  return address.address;
}
