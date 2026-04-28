import React, { useState } from 'react';
import { ArrowLeft, Upload, AlertCircle, Loader } from 'lucide-react';
import { createInvoice } from '../services/invoiceApi';
import { triggerChatNotification } from './FintrixAssistant';
import { ConnectedWallet } from '../types';

interface UploadInvoiceViewProps {
  wallet: ConnectedWallet;
  onSuccess: () => void;
  onBack: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function UploadInvoiceView({
  wallet,
  onSuccess,
  onBack,
  showToast,
}: UploadInvoiceViewProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    amount: '',
    dueDate: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

      triggerChatNotification(
        "AI Verification complete for this invoice. Risk Level: LOW. Trust Score: 82/100. " +
        "Key indicators: Fixed repayment timeline, Tier-1 supplier, short-term exposure only. " +
        "Invoice is marketplace-ready."
      );

      showToast('Your invoice is now listed for funding', 'success');
      onSuccess();
    } catch (error: any) {
      showToast(error.message || 'Failed to create invoice', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Default to 30 days from now
  const defaultDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-5 py-8 md:px-[120px] md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <button
            onClick={onBack}
            className="mb-8 flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          {/* Title Section */}
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.28em] text-white/38 mb-4">For Businesses</p>
            <h1 className="text-4xl md:text-5xl font-semibold text-white mb-3">Upload Invoice</h1>
            <p className="text-white/60 text-lg">
              Submit your invoice details to get listed on the marketplace for investors to fund.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8 rounded-[24px] border border-white/10 bg-white/[0.02] p-8 hover:border-white/20 hover:bg-white/[0.04] transition-all">
            {/* Buyer Name */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Buyer Name
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                placeholder="e.g., Acme Corp"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/40 transition-colors"
              />
              <p className="text-xs text-white/50 mt-2">
                The company that owes this invoice
              </p>
            </div>

            {/* Invoice Amount */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Invoice Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-white/40 font-semibold">$</span>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/40 transition-colors"
                />
              </div>
              <p className="text-xs text-white/50 mt-2">
                Amount you want to get funded for
              </p>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate || defaultDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:outline-none focus:border-blue-500/40 transition-colors"
              />
              <p className="text-xs text-white/50 mt-2">
                When the invoice will be repaid by the buyer
              </p>
            </div>

            {/* Info Box */}
            <div className="rounded-[20px] border border-blue-500/20 bg-blue-500/10 p-5 flex gap-4">
              <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-white mb-2">Your wallet</p>
                <p className="font-mono text-xs text-white/70 break-all bg-white/5 rounded-lg px-3 py-2 border border-white/10">{wallet.publicKey}</p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-3 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  List Invoice
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
