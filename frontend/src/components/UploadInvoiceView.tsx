import React, { useState } from 'react';
import { ArrowLeft, Upload, AlertCircle, Loader } from 'lucide-react';
import { createInvoice } from '../services/invoiceApi';
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
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        {/* Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-4">
            <Upload className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-blue-300">For Businesses</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Upload Invoice</h1>
          <p className="text-slate-400 text-lg">
            Submit your invoice details to get listed on the marketplace for investors to fund.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800/50 border border-white/10 rounded-xl p-8">
          {/* Buyer Name */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Buyer Name
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              placeholder="e.g., Acme Corp"
              className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <p className="text-xs text-slate-500 mt-1">
              The company that owes this invoice
            </p>
          </div>

          {/* Invoice Amount */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Invoice Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-500">$</span>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full pl-8 pr-4 py-3 rounded-lg bg-slate-700 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Amount you want to get funded for
            </p>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate || defaultDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-white/10 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
            <p className="text-xs text-slate-500 mt-1">
              When the invoice will be repaid by the buyer
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
            <div className="text-sm text-blue-200">
              <p className="font-semibold mb-1">Your wallet is attached to this invoice</p>
              <p className="font-mono text-xs text-blue-300/70 break-all">{wallet.publicKey}</p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Submit Invoice
              </>
            )}
          </button>

          <p className="text-xs text-slate-500 text-center">
            Once submitted, your invoice will appear in the marketplace for investors to fund.
          </p>
        </form>
      </div>
    </div>
  );
}
