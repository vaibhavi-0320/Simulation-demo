export type InvoiceStatus = "active" | "funded" | "repaid";

export interface InvoiceRecord {
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
  escrowWallet?: string;
  fundingWallet?: string;
}

export interface TransactionRecord {
  type: "Fund" | "List" | "Repay";
  name: string;
  amount: string;
  xlm: string;
  status: "Success" | "Pending";
  time: string;
}

export interface VisitorRecord {
  id: string;
  firstSeenAt: string;
  lastSeenAt: string;
  visits: number;
  userAgent?: string;
  language?: string;
  platform?: string;
}

export interface StoreState {
  invoices: InvoiceRecord[];
  transactions: TransactionRecord[];
  visitors: VisitorRecord[];
}
