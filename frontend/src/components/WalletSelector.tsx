import React, { useState } from 'react';
import { Wallet, X } from 'lucide-react';

interface WalletSelectorProps {
  onSelectWallet: (walletType: 'freighter' | 'albedo') => void;
  loading?: boolean;
  selectedWallet?: 'freighter' | 'albedo' | null;
  onClose?: () => void;
}

export const WalletSelector: React.FC<WalletSelectorProps> = ({
  onSelectWallet,
  loading = false,
  selectedWallet = null,
  onClose,
}) => {
  const [hoveredWallet, setHoveredWallet] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-2xl">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Connect Wallet</h2>
          </div>
          <p className="text-sm text-slate-400">Choose your preferred wallet to get started</p>
        </div>

        {/* Wallet Cards */}
        <div className="space-y-3">
          {/* Freighter Card */}
          <button
            onClick={() => onSelectWallet('freighter')}
            disabled={loading}
            onMouseEnter={() => setHoveredWallet('freighter')}
            onMouseLeave={() => setHoveredWallet(null)}
            className={`w-full group relative overflow-hidden rounded-xl border transition-all duration-200 ${
              selectedWallet === 'freighter'
                ? 'border-blue-500 bg-blue-500/10'
                : hoveredWallet === 'freighter'
                  ? 'border-blue-500/50 bg-blue-500/5'
                  : 'border-white/10 bg-white/5'
            } p-4 text-left disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white mb-1">Freighter</h3>
                <p className="text-xs text-slate-400">Browser extension</p>
              </div>
              {loading && selectedWallet === 'freighter' && (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                </div>
              )}
              {!loading && selectedWallet === 'freighter' && (
                <div className="h-5 w-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                </div>
              )}
              {!loading && selectedWallet !== 'freighter' && (
                <div className="h-5 w-5 rounded-full border-2 border-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              )}
            </div>
          </button>

          {/* Albedo Card */}
          <button
            onClick={() => onSelectWallet('albedo')}
            disabled={loading}
            onMouseEnter={() => setHoveredWallet('albedo')}
            onMouseLeave={() => setHoveredWallet(null)}
            className={`w-full group relative overflow-hidden rounded-xl border transition-all duration-200 ${
              selectedWallet === 'albedo'
                ? 'border-purple-500 bg-purple-500/10'
                : hoveredWallet === 'albedo'
                  ? 'border-purple-500/50 bg-purple-500/5'
                  : 'border-white/10 bg-white/5'
            } p-4 text-left disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white mb-1">Albedo Wallet</h3>
                <p className="text-xs text-slate-400">Connect using Albedo — a web-based Stellar wallet. No extension needed.</p>
              </div>
              {loading && selectedWallet === 'albedo' && (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                </div>
              )}
              {!loading && selectedWallet === 'albedo' && (
                <div className="h-5 w-5 rounded-full border-2 border-purple-500 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                </div>
              )}
              {!loading && selectedWallet !== 'albedo' && (
                <div className="h-5 w-5 rounded-full border-2 border-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              )}
            </div>
          </button>
        </div>

        {/* Info Text */}
        <p className="mt-6 text-xs text-slate-500 text-center">
          By connecting a wallet, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};
