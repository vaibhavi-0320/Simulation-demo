/**
 * Simple API client for DeFi Invoice Marketplace
 * Uses Vite proxy — all /api calls go to localhost:3001 in dev
 */
const API_BASE = import.meta.env.VITE_API_BASE || '/api';
async function apiCall(endpoint, options) {
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
    }
    catch (error) {
        console.error(`API call failed: ${endpoint}`, error);
        throw error;
    }
}
// Health check
export async function healthCheck() {
    return apiCall('/health');
}
// Invoices
export async function createInvoice(params) {
    return apiCall('/invoice/create', {
        method: 'POST',
        body: JSON.stringify(params),
    });
}
export async function getAllInvoices() {
    return apiCall('/invoice/all');
}
export async function getInvoiceById(id) {
    return apiCall(`/invoice/${id}`);
}
// Funding
export async function fundInvoice(params) {
    return apiCall('/invoice/fund', {
        method: 'POST',
        body: JSON.stringify(params),
    });
}
// Repayment
export async function repayInvoice(params) {
    return apiCall('/invoice/repay', {
        method: 'POST',
        body: JSON.stringify(params),
    });
}
// Transactions
export async function getTransactions() {
    return apiCall('/transactions');
}
// Stats
export async function getStats() {
    return apiCall('/stats');
}
// Chatbot
export async function chatWithAssistant(params) {
    return apiCall('/chat', {
        method: 'POST',
        body: JSON.stringify(params),
    });
}
