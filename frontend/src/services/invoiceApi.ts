/**
 * Simple API client for DeFi Invoice Marketplace
 * Uses Vite proxy — all /api calls go to localhost:3001 in dev
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Invoice {
  id: string;
  ownerWallet: string;
  companyName: string;
  amount: number;
  dueDate: string;
  fundedAmount: number;
  funders: Array<{ wallet: string; amount: number }>;
  status: 'OPEN' | 'FUNDED' | 'COMPLETED' | 'REPAID';
  yield: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'CREATE' | 'FUND' | 'REPAY';
  invoiceId: string;
  userWallet: string;
  amount: number;
  timestamp: string;
}

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(json.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return json.data || json;
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
}

// Health check
export async function healthCheck(): Promise<{ status: string; service: string }> {
  return apiCall('/health');
}

// Invoices
export async function createInvoice(params: {
  ownerWallet: string;
  companyName: string;
  amount: number;
  dueDate: string;
}): Promise<{ message: string; invoice: Invoice }> {
  return apiCall('/invoice/create', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function getAllInvoices(): Promise<Invoice[]> {
  return apiCall('/invoice/all');
}

export async function getInvoiceById(id: string): Promise<Invoice> {
  return apiCall(`/invoice/${id}`);
}

// Funding
export async function fundInvoice(params: {
  invoiceId: string;
  funderWallet: string;
  fundAmount: number;
}): Promise<{
  message: string;
  invoice: Invoice;
  fundedAmount: number;
  expectedReturn: number;
}> {
  return apiCall('/invoice/fund', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// Repayment
export async function repayInvoice(params: {
  invoiceId: string;
  ownerWallet: string;
}): Promise<{
  message: string;
  invoice: Invoice;
  funderReturns: Array<{
    wallet: string;
    funded: number;
    returned: number;
    profit: number;
  }>;
}> {
  return apiCall('/invoice/repay', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// Transactions
export async function getTransactions(): Promise<Transaction[]> {
  return apiCall('/transactions');
}

// Stats
export async function getStats(): Promise<{
  totalInvoices: number;
  activeInvoices: number;
  totalOpportunity: number;
  totalFunded: number;
  averageYield: string;
  fundedInvoices: number;
}> {
  return apiCall('/stats');
}

// Chatbot
export async function chatWithAssistant(params: {
  question?: string;
  view?: string;
}): Promise<{
  answer: string;
  suggestions?: string[];
}> {
  return apiCall('/chat', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
