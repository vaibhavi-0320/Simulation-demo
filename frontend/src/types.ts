export type InvoiceStatus = "active" | "funded" | "repaid";

export type WalletProvider = "freighter" | "albedo" | "phyto" | "demo";

export interface Invoice {
  id: string;
  buyer: string;
  amount: number;
  discount: number;
  due: string;
  status: InvoiceStatus;
  seller: string;
  funder?: string;
  yield: number;
  funded: number;
  tags: string[];
  riskScore: number;
  aiSummary: string;
  txHash?: string;
  companyName?: string;
  industry?: string;
  country?: string;
}

export interface ConnectedWallet {
  publicKey: string;
  provider: WalletProvider;
  label: string;
}

export interface UserState {
  wallet: ConnectedWallet | null;
  role: "exporter" | "investor";
  totalInvested: number;
  totalReturns: number;
  roi: number;
  dealsCompleted: number;
  xlmBalance: number;
}

export interface Transaction {
  type: "Fund" | "List" | "Repay";
  name: string;
  amount: string;
  xlm: string;
  status: "Success" | "Pending";
  time: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  tag: string;
  roi: string;
  totalReturns: string;
  deals: number;
}

export interface WalletOption {
  id: WalletProvider;
  name: string;
  description: string;
  accent: string;
  mode: "extension" | "bridge" | "manual";
}

export interface InvoiceDraft {
  amount: string;
  dueDate: string;
  buyer: string;
  number: string;
  discount: number;
  notes: string;
}

export interface InvoiceParseResult {
  amount: number;
  dueDate: string;
  buyerName: string;
  invoiceNumber: string;
  summary?: string;
}
