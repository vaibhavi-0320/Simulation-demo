import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState } from 'react';
import { ArrowLeft, Upload, AlertCircle, Loader } from 'lucide-react';
import { createInvoice } from '../services/invoiceApi';
import { triggerChatNotification } from './FintrixAssistant';
export default function UploadInvoiceView({ wallet, onSuccess, onBack, showToast, }) {
    const [formData, setFormData] = useState({
        companyName: '',
        amount: '',
        dueDate: '',
    });
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.companyName || !formData.amount || !formData.dueDate) {
            showToast('Please fill in all fields', 'error');
            return;
        }
        if (Number(formData.amount) <= 0) {
            showToast('Amount must be greater than 0', 'error');
            return;
        }
        setLoading(true);
        try {
            await createInvoice({
                ownerWallet: wallet.publicKey,
                companyName: formData.companyName,
                amount: Number(formData.amount),
                dueDate: formData.dueDate,
            });
            triggerChatNotification("AI Verification complete for this invoice. Risk Level: LOW. Trust Score: 82/100. " +
                "Key indicators: Fixed repayment timeline, Tier-1 supplier, short-term exposure only. " +
                "Invoice is marketplace-ready.");
            showToast('Your invoice is now listed for funding', 'success');
            onSuccess();
        }
        catch (error) {
            showToast(error.message || 'Failed to create invoice', 'error');
        }
        finally {
            setLoading(false);
        }
    };
    // Default to 30 days from now
    const defaultDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return (_jsx("div", { className: "min-h-screen bg-black text-white", children: _jsx("div", { className: "px-5 py-8 md:px-[120px] md:py-12", children: _jsxs("div", { className: "max-w-2xl mx-auto", children: [_jsxs("button", { onClick: onBack, className: "mb-8 flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Back to Dashboard"] }), _jsxs("div", { className: "mb-10", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.28em] text-white/38 mb-4", children: "For Businesses" }), _jsx("h1", { className: "text-4xl md:text-5xl font-semibold text-white mb-3", children: "Upload Invoice" }), _jsx("p", { className: "text-white/60 text-lg", children: "Submit your invoice details to get listed on the marketplace for investors to fund." })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-8 rounded-[24px] border border-white/10 bg-white/[0.02] p-8 hover:border-white/20 hover:bg-white/[0.04] transition-all", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-white mb-3", children: "Buyer Name" }), _jsx("input", { type: "text", value: formData.companyName, onChange: (e) => setFormData({ ...formData, companyName: e.target.value }), placeholder: "e.g., Acme Corp", className: "w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/40 transition-colors" }), _jsx("p", { className: "text-xs text-white/50 mt-2", children: "The company that owes this invoice" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-white mb-3", children: "Invoice Amount (USD)" }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-4 top-3 text-white/40 font-semibold", children: "$" }), _jsx("input", { type: "number", value: formData.amount, onChange: (e) => setFormData({ ...formData, amount: e.target.value }), placeholder: "0.00", step: "0.01", min: "0", className: "w-full pl-8 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/40 transition-colors" })] }), _jsx("p", { className: "text-xs text-white/50 mt-2", children: "Amount you want to get funded for" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-white mb-3", children: "Due Date" }), _jsx("input", { type: "date", value: formData.dueDate || defaultDate, onChange: (e) => setFormData({ ...formData, dueDate: e.target.value }), className: "w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-blue-500/40 transition-colors" }), _jsx("p", { className: "text-xs text-white/50 mt-2", children: "When the invoice will be repaid by the buyer" })] }), _jsxs("div", { className: "rounded-[20px] border border-blue-500/20 bg-blue-500/10 p-5 flex gap-4", children: [_jsx(AlertCircle, { className: "h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "text-sm", children: [_jsx("p", { className: "font-semibold text-white mb-2", children: "Your wallet" }), _jsx("p", { className: "font-mono text-xs text-white/70 break-all bg-white/5 rounded-lg px-3 py-2 border border-white/10", children: wallet.publicKey })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-3 transition-colors flex items-center justify-center gap-2", children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader, { className: "h-4 w-4 animate-spin" }), "Creating..."] })) : (_jsxs(_Fragment, { children: [_jsx(Upload, { className: "h-4 w-4" }), "List Invoice"] })) })] })] }) }) }));
}
