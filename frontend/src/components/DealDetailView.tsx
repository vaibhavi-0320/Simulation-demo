import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader, AlertCircle, Check, Lock, DollarSign } from 'lucide-react';
import { getInvoiceById, fundInvoice, repayInvoice, Invoice } from '../services/invoiceApi';
import { ConnectedWallet } from '../types';

interface DealDetailViewProps {
  wallet: ConnectedWallet;
  dealId: string;
  onBack: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function DealDetailView({
  wallet,
  dealId,
  onBack,
  showToast,
}: DealDetailViewProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [fundAmount, setFundAmount] = useState('');
  const [funding, setFunding] = useState(false);
  const [repaying, setRepaying] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [dealId]);

  const loadInvoice = async () => {
    setLoading(true);
    try {
      const data = await getInvoiceById(dealId);
      setInvoice(data);
      const available = Math.min(data.amount - data.fundedAmount, data.amount);
      setFundAmount(Math.min(available, 500).toString());
    } catch (error: any) {
      showToast(error.message || 'Failed to load invoice', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFund = async () => {
    if (!invoice) return;

    const amount = Number(fundAmount);
    if (!Number.isFinite(amount) || amount < 100) {
      showToast('Minimum investment is $100', 'error');
      return;
    }

    if (invoice.ownerWallet === wallet.publicKey) {
      showToast('You cannot fund your own invoice', 'error');
      return;
    }

    const remaining = invoice.amount - invoice.fundedAmount;
    if (amount > remaining) {
      showToast(`Maximum amount is $${remaining.toLocaleString()}`, 'error');
      return;
    }

    setFunding(true);
    try {
      const result = await fundInvoice({
        invoiceId: invoice.id,
        funderWallet: wallet.publicKey,
        fundAmount: amount,
      });

      setInvoice(result.invoice);
      showToast(
        `You funded $${amount.toLocaleString()}. Expected return: $${result.expectedReturn.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
        'success'
      );
    } catch (error: any) {
      showToast(error.message || 'Failed to fund invoice', 'error');
    } finally {
      setFunding(false);
    }
  };

  const handleRepay = async () => {
    if (!invoice) return;

    if (invoice.ownerWallet !== wallet.publicKey) {
      showToast('Only the invoice owner can mark as repaid', 'error');
      return;
    }

    setRepaying(true);
    try {
      const result = await repayInvoice({
        invoiceId: invoice.id,
        ownerWallet: wallet.publicKey,
      });

      setInvoice(result.invoice);
      showToast('Invoice marked as repaid. Returns distributed to funders.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to repay invoice', 'error');
    } finally {
      setRepaying(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-24 flex items-center justify-center">
        <Loader className="h-6 w-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="px-4 py-12">
        <div className="max-w-2xl mx-auto bg-slate-800/50 border border-white/10 rounded-xl p-8 text-center">
          <p className="text-slate-400 mb-4">Invoice not found</p>
          <button
            onClick={onBack}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const daysUntilDue = Math.ceil(
    (new Date(invoice.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const progress =
    invoice.fundedAmount > 0
      ? Math.min(100, Math.round((invoice.fundedAmount / invoice.amount) * 100))
      : 0;

  const available = Math.max(invoice.amount - invoice.fundedAmount, 0);
  const isOwner = invoice.ownerWallet === wallet.publicKey;

  // Calculate expected return based on the FUND AMOUNT, not the invoice amount
  const userFundAmt = Number(fundAmount) || 0;
  const expectedReturnOnFund = userFundAmt * (1 + invoice.yield / 100);

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{invoice.companyName}</h1>
                  <p className="text-blue-100">{invoice.id}</p>
                </div>
                <span
                  className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                    invoice.status === 'OPEN'
                      ? 'bg-green-500/20 text-green-300'
                      : invoice.status === 'FUNDED'
                        ? 'bg-blue-500/20 text-blue-300'
                        : invoice.status === 'REPAID'
                          ? 'bg-white/20 text-white'
                          : 'bg-white/20 text-white'
                  }`}
                >
                  {invoice.status}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">
                  ${invoice.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Invoice Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 border border-white/10 rounded-lg p-6">
                <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Yield</p>
                <p className="text-2xl font-bold text-green-400">{invoice.yield.toFixed(1)}%</p>
                <p className="text-xs text-slate-500 mt-2">Return on this invoice</p>
              </div>

              <div className="bg-slate-800/50 border border-white/10 rounded-lg p-6">
                <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Duration</p>
                <p className="text-2xl font-bold text-white">{daysUntilDue} days</p>
                <p className="text-xs text-slate-500 mt-2">Due: {formatDate(invoice.dueDate)}</p>
              </div>

              <div className="bg-slate-800/50 border border-white/10 rounded-lg p-6">
                <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Funded</p>
                <p className="text-2xl font-bold text-white">{progress}%</p>
                <p className="text-xs text-slate-500 mt-2">of total amount</p>
              </div>
            </div>

            {/* Funding Progress */}
            <div className="bg-slate-800/50 border border-white/10 rounded-lg p-6">
              <p className="text-sm font-semibold text-white mb-4">Funding Progress</p>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-4 text-sm text-slate-400">
                <span>
                  ${invoice.fundedAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })} funded
                </span>
                <span>
                  ${invoice.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })} total
                </span>
              </div>
            </div>

            {/* Funders List */}
            {invoice.funders.length > 0 && (
              <div className="bg-slate-800/50 border border-white/10 rounded-lg p-6">
                <p className="text-sm font-semibold text-white mb-4">Funders ({invoice.funders.length})</p>
                <div className="space-y-3">
                  {invoice.funders.map((funder, idx) => {
                    const funderReturn = funder.amount * (1 + invoice.yield / 100);
                    return (
                      <div key={idx} className="flex items-center justify-between text-sm bg-slate-700/30 rounded-lg px-4 py-3">
                        <span className="text-slate-400 font-mono text-xs">
                          {funder.wallet.slice(0, 8)}...{funder.wallet.slice(-8)}
                        </span>
                        <div className="text-right">
                          <span className="text-white font-semibold">
                            ${funder.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </span>
                          <span className="text-green-400 text-xs ml-2">
                            → ${funderReturn.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Repayment Info */}
            {invoice.status === 'REPAID' && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 flex gap-4">
                <Check className="h-6 w-6 text-green-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white mb-1">Repayment Complete</p>
                  <p className="text-sm text-green-200">
                    Returns have been distributed to all funders.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Funding Panel */}
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6 h-fit sticky top-20">
            <h3 className="text-2xl font-bold text-white mb-6">
              {isOwner ? 'Manage Invoice' : 'Fund This Invoice'}
            </h3>

            {/* Investor can fund — OPEN status and not own invoice */}
            {!isOwner && invoice.status === 'OPEN' && available > 0 ? (
              <>
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase mb-2">
                      Amount to Fund
                    </p>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                      <input
                        type="number"
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                        min="100"
                        max={available}
                        className="w-full pl-8 pr-3 py-2.5 rounded-lg bg-slate-700 border border-white/10 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Available: ${available.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-xs text-slate-400 mb-1">Your Expected Return</p>
                    <p className="text-xl font-bold text-blue-300">
                      ${expectedReturnOnFund.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-green-400 mt-1">
                      Profit: +${(expectedReturnOnFund - userFundAmt).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                      {' '}({invoice.yield.toFixed(1)}% yield)
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleFund}
                  disabled={funding}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {funding ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-5 w-5" />
                      Fund Now
                    </>
                  )}
                </button>

                <p className="text-xs text-slate-500 mt-4">
                  <Lock className="h-3 w-3 inline mr-1" />
                  Minimum investment: $100
                </p>
              </>
            ) : isOwner && invoice.status !== 'REPAID' ? (
              /* Owner can repay — for both OPEN and FUNDED (demo) */
              <>
                <p className="text-sm text-slate-300 mb-4">
                  {invoice.status === 'FUNDED'
                    ? 'This invoice is fully funded. Mark it as repaid to distribute returns to all funders.'
                    : 'Mark this invoice as repaid to complete the cycle and distribute returns to funders.'}
                </p>

                {invoice.funders.length > 0 && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                    <p className="text-xs text-slate-400 mb-1">Total to distribute</p>
                    <p className="text-lg font-bold text-blue-300">
                      ${invoice.funders.reduce((sum, f) => sum + f.amount * (1 + invoice.yield / 100), 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      to {invoice.funders.length} funder{invoice.funders.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleRepay}
                  disabled={repaying}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {repaying ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Mark as Repaid
                    </>
                  )}
                </button>

                {invoice.funders.length === 0 && (
                  <p className="text-xs text-slate-500 mt-4">
                    No funders yet — waiting for investors.
                  </p>
                )}
              </>
            ) : invoice.status === 'REPAID' ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                <Check className="h-6 w-6 text-green-400 mx-auto mb-2" />
                <p className="font-semibold text-white">Repayment Complete</p>
                <p className="text-xs text-green-200 mt-2">
                  Returns have been distributed to all funders.
                </p>
              </div>
            ) : isOwner ? (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                <AlertCircle className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                <p className="font-semibold text-white">Your Invoice</p>
                <p className="text-xs text-blue-200 mt-2">
                  Waiting for investors to fund this invoice.
                </p>
              </div>
            ) : (
              <div className="bg-slate-700 border border-white/10 rounded-lg p-4 text-center">
                <p className="text-slate-300">This invoice is no longer available for funding.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
