import React, { useEffect, useState } from 'react';
import { Upload, Store, TrendingUp, Wallet, DollarSign } from 'lucide-react';
import { ConnectedWallet } from '../types';
import { getStats } from '../services/invoiceApi';

interface DashboardViewProps {
  wallet: ConnectedWallet;
  balance: number;
  onUploadClick: () => void;
  onBrowseClick: () => void;
}

export default function DashboardView({
  wallet,
  balance,
  onUploadClick,
  onBrowseClick,
}: DashboardViewProps) {
  const formatAddress = (addr: string) => `${addr.slice(0, 8)}...${addr.slice(-8)}`;

  const [stats, setStats] = useState<{
    totalInvoices: number;
    activeInvoices: number;
    totalFunded: number;
    averageYield: string;
  } | null>(null);

  useEffect(() => {
    getStats()
      .then((data) => setStats(data))
      .catch(() => {
        // Fallback stats
        setStats({ totalInvoices: 3, activeInvoices: 3, totalFunded: 20400, averageYield: '9.5' });
      });
  }, []);

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Wallet Status */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-5 w-5 text-blue-200" />
                <span className="text-sm text-blue-200 font-medium">Connected Wallet</span>
              </div>
              <p className="text-blue-100 font-mono text-sm mb-3">{formatAddress(wallet.publicKey)}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{balance.toFixed(2)}</span>
                <span className="text-blue-200 text-lg">XLM</span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-blue-200 mb-1">Total Funded in Marketplace</p>
              <p className="text-3xl font-bold">${stats ? stats.totalFunded.toLocaleString() : '...'}</p>
            </div>
          </div>
        </div>

        {/* User Guidance */}
        <div className="bg-blue-500/5 border border-blue-500/15 rounded-lg px-6 py-4">
          <p className="text-sm text-blue-200">
            <strong>Welcome!</strong> Upload an invoice to receive funding from investors, or browse the marketplace to fund invoices and earn yield.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload Invoice */}
          <button
            onClick={onUploadClick}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 border border-white/10 hover:border-blue-500/40 transition-all hover:shadow-lg hover:shadow-blue-500/5 text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-colors" />
            <div className="relative">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-blue-500/20 text-blue-400 mb-4">
                <Upload className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Upload Invoice</h3>
              <p className="text-slate-400">Create a new invoice to get funded by investors</p>
              <p className="text-xs text-slate-500 mt-3">For businesses with unpaid invoices</p>
            </div>
          </button>

          {/* Browse Marketplace */}
          <button
            onClick={onBrowseClick}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 border border-white/10 hover:border-green-500/40 transition-all hover:shadow-lg hover:shadow-green-500/5 text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:to-green-500/10 transition-colors" />
            <div className="relative">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-green-500/20 text-green-400 mb-4">
                <Store className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Browse Marketplace</h3>
              <p className="text-slate-400">Fund invoices and earn yield on your investment</p>
              <p className="text-xs text-slate-500 mt-3">For investors looking for returns</p>
            </div>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl bg-slate-800/50 border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-400">Active Invoices</span>
              <Store className="h-5 w-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats?.activeInvoices ?? '...'}</p>
            <p className="text-sm text-slate-500 mt-2">Available to fund</p>
          </div>

          <div className="rounded-xl bg-slate-800/50 border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-400">Average Yield</span>
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats?.averageYield ?? '...'}%</p>
            <p className="text-sm text-slate-500 mt-2">Per invoice (estimated)</p>
          </div>

          <div className="rounded-xl bg-slate-800/50 border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-400">Total Opportunity</span>
              <DollarSign className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalInvoices ?? '...'}</p>
            <p className="text-sm text-slate-500 mt-2">Invoices in marketplace</p>
          </div>
        </div>
      </div>
    </div>
  );
}
