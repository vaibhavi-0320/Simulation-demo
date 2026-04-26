import React, { useEffect, useState } from 'react';
import { ArrowLeft, Store, Loader, TrendingUp, DollarSign } from 'lucide-react';
import { getAllInvoices, fundInvoice, Invoice } from '../services/invoiceApi';
import { ConnectedWallet } from '../types';

interface MarketplaceViewProps {
  wallet: ConnectedWallet;
  onDealClick: (dealId: string) => void;
  onBack: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function MarketplaceView({
  wallet,
  onDealClick,
  onBack,
  showToast,
}: MarketplaceViewProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [fundingId, setFundingId] = useState<string | null>(null);
  const [quickFundAmount, setQuickFundAmount] = useState<Record<string, string>>({});

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await getAllInvoices();
      setInvoices(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilDue = (dateStr: string) => {
    const due = new Date(dateStr);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getProgressPercent = (invoice: Invoice) => {
    if (invoice.fundedAmount === 0) return 0;
    return Math.min(100, Math.round((invoice.fundedAmount / invoice.amount) * 100));
  };

  const handleQuickFund = async (e: React.MouseEvent, invoice: Invoice) => {
    e.stopPropagation(); // Don't navigate to deal page

    if (invoice.ownerWallet === wallet.publicKey) {
      showToast('You cannot fund your own invoice', 'error');
      return;
    }

    const amount = Number(quickFundAmount[invoice.id] || 500);
    if (!Number.isFinite(amount) || amount < 100) {
      showToast('Minimum investment is $100', 'error');
      return;
    }

    const remaining = invoice.amount - invoice.fundedAmount;
    if (amount > remaining) {
      showToast(`Maximum amount is $${remaining.toLocaleString()}`, 'error');
      return;
    }

    setFundingId(invoice.id);
    try {
      const result = await fundInvoice({
        invoiceId: invoice.id,
        funderWallet: wallet.publicKey,
        fundAmount: amount,
      });

      showToast(
        `You funded $${amount.toLocaleString()}. Expected return: $${result.expectedReturn.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
        'success'
      );
      loadInvoices(); // Refresh
    } catch (error: any) {
      showToast(error.message || 'Failed to fund invoice', 'error');
    } finally {
      setFundingId(null);
    }
  };

  const totalOpportunity = invoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
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
          <div className="inline-flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-4">
            <Store className="h-4 w-4 text-green-400" />
            <span className="text-sm text-green-300">Live Marketplace</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Marketplace</h1>
              <p className="text-slate-400 text-lg">
                Fund invoices to earn yield. You cannot fund your own invoice.
              </p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-6 py-4">
              <p className="text-sm text-slate-400">Total Opportunity</p>
              <p className="text-3xl font-bold text-white">
                ${totalOpportunity.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-6 w-6 text-blue-400 animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-white/10">
            <Store className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No invoices available yet</p>
            <p className="text-slate-500 text-sm mt-2">Upload an invoice to get started</p>
          </div>
        ) : (
          <div className="space-y-6">
            {invoices.map((invoice) => {
              const daysUntilDue = getDaysUntilDue(invoice.dueDate);
              const progress = getProgressPercent(invoice);
              const isOwn = invoice.ownerWallet === wallet.publicKey;
              const remaining = invoice.amount - invoice.fundedAmount;
              const isFunding = fundingId === invoice.id;

              return (
                <div
                  key={invoice.id}
                  className="bg-slate-800/50 border border-white/10 hover:border-blue-500/40 rounded-xl p-6 transition-all hover:shadow-lg group"
                >
                  {/* Click area for detail */}
                  <button
                    onClick={() => onDealClick(invoice.id)}
                    className="w-full text-left"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                      {/* Company & Status */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs text-slate-500 font-semibold uppercase">Company</p>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              invoice.status === 'OPEN'
                                ? 'bg-green-500/15 text-green-400'
                                : invoice.status === 'FUNDED'
                                  ? 'bg-blue-500/15 text-blue-400'
                                  : 'bg-slate-500/15 text-slate-400'
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white">{invoice.companyName}</h3>
                        {isOwn && (
                          <span className="text-[10px] bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded-full font-semibold mt-1 inline-block">
                            YOUR INVOICE
                          </span>
                        )}
                      </div>

                      {/* Amount */}
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Amount</p>
                        <p className="text-2xl font-bold text-white">
                          ${invoice.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </p>
                      </div>

                      {/* Yield & Duration */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Yield</p>
                          <p className="text-lg font-bold text-green-400 flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {invoice.yield.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Duration</p>
                          <p className="text-lg font-bold text-white">{daysUntilDue}d</p>
                        </div>
                      </div>

                      {/* Progress */}
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Funding</p>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          {progress}% — ${invoice.fundedAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })} / $
                          {invoice.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </p>
                      </div>

                      {/* Quick Fund */}
                      <div className="flex items-end justify-end">
                        {invoice.status === 'REPAID' ? (
                          <span className="text-xs bg-slate-600/20 text-slate-400 px-3 py-2 rounded-lg font-medium">
                            Completed
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </button>

                  {/* Quick Fund Row */}
                  {invoice.status === 'OPEN' && !isOwn && remaining > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-xs text-slate-500">Quick fund:</span>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1.5 text-slate-500 text-xs">$</span>
                          <input
                            type="number"
                            value={quickFundAmount[invoice.id] ?? '500'}
                            onChange={(e) => {
                              e.stopPropagation();
                              setQuickFundAmount({ ...quickFundAmount, [invoice.id]: e.target.value });
                            }}
                            onClick={(e) => e.stopPropagation()}
                            min="100"
                            max={remaining}
                            className="w-28 pl-6 pr-2 py-1.5 text-xs rounded-lg bg-slate-700 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <span className="text-xs text-slate-500">
                          (max: ${remaining.toLocaleString()})
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleQuickFund(e, invoice)}
                        disabled={isFunding}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        {isFunding ? (
                          <>
                            <Loader className="h-3.5 w-3.5 animate-spin" />
                            Funding...
                          </>
                        ) : (
                          <>
                            <DollarSign className="h-3.5 w-3.5" />
                            Fund
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {invoice.status === 'OPEN' && isOwn && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-xs text-slate-500">
                        This is your invoice — waiting for investors to fund it.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
