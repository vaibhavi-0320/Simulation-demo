import * as StellarSdk from "stellar-sdk";
import { getAddress, getNetworkDetails, isAllowed, isConnected, requestAccess } from "@stellar/freighter-api";
import { ConnectedWallet, Invoice, Transaction, WalletProvider } from "../types";

const horizonServer = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function validatePublicKey(publicKey: string) {
  return StellarSdk.StrKey.isValidEd25519PublicKey(publicKey.trim());
}

export async function connectFreighterWallet(): Promise<ConnectedWallet> {
  const status = await isConnected();
  if (status.error) {
    throw new Error(status.error.message);
  }

  if (!status.isConnected) {
    throw new Error("Freighter extension not detected. Open the extension and try again.");
  }

  const permission = await isAllowed();
  if (permission.error) {
    throw new Error(permission.error.message);
  }

  const access = permission.isAllowed ? await getAddress() : await requestAccess();
  if (access.error) {
    throw new Error(access.error.message);
  }

  const fallback = !access.address ? await getAddress() : access;
  if (fallback.error || !fallback.address) {
    throw new Error(fallback.error?.message || "Freighter is connected but did not return an address. Re-open Freighter, approve this site, and try again.");
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
      publicKey: "GDEMO7QY5G4J6GQQF6T6X3GW6WOYFXKSGP2CYNV6GYZ2Q6XXDEMO",
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

export async function getInvoices(): Promise<Invoice[]> {
  const res = await readJson<{ success: boolean; data: Invoice[] } | Invoice[]>(await fetch("/api/invoices"));
  const arr = Array.isArray(res) ? res : (res as { data: Invoice[] }).data;
  return Array.isArray(arr) ? arr : [];
}

export async function createInvoice(payload: {
  amount: number;
  due: string;
  buyer: string;
  number?: string;
  discount: number;
  seller: string;
  notes?: string;
}): Promise<Invoice> {
  const res = await readJson<{ success: boolean; data: Invoice } | Invoice>(
    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
  return (res as { data: Invoice }).data ?? (res as Invoice);
}

export async function fundInvoiceOnBackend(invoiceId: string, funder: string, provider: WalletProvider): Promise<Invoice> {
  const res = await readJson<{ success: boolean; data: Invoice } | Invoice>(
    await fetch(`/api/invoice-action?id=${encodeURIComponent(invoiceId)}&action=fund`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ funder, provider }),
    }),
  );
  return (res as { data: Invoice }).data ?? (res as Invoice);
}

export async function repayInvoiceOnBackend(invoiceId: string): Promise<Invoice> {
  const res = await readJson<{ success: boolean; data: Invoice } | Invoice>(
    await fetch(`/api/invoice-action?id=${encodeURIComponent(invoiceId)}&action=repay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }),
  );
  return (res as { data: Invoice }).data ?? (res as Invoice);
}

export async function getTransactions(): Promise<Transaction[]> {
  const res = await readJson<{ success: boolean; data: Transaction[] } | Transaction[]>(await fetch("/api/transactions"));
  const arr = Array.isArray(res) ? res : (res as { data: Transaction[] }).data;
  return Array.isArray(arr) ? arr : [];
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

