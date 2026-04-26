import React from 'react';

interface LandingPageProps {
  onLaunch: () => void;
  loading?: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLaunch, loading }) => {
  return (
    <div className="antialiased overflow-x-hidden">
      {/* Minimal TopBar */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-900 font-inter text-sm font-medium tracking-wide antialiased">
        <div className="flex justify-between items-center px-6 py-4 md:px-[120px]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div className="text-xl font-black tracking-tighter text-white">Fintrix</div>
          </div>
          <button
            className="bg-white text-black px-6 py-2.5 rounded-full font-semibold hover:bg-gray-200 transition-all duration-200 active:scale-95 disabled:opacity-50"
            onClick={onLaunch}
            disabled={loading}
          >
            {loading ? 'Connecting...' : 'Launch App'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-black">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="hero-globe"></div>
          <div className="hero-grid"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Turn Unpaid Invoices
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Into Instant Cash</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-4 max-w-2xl mx-auto leading-relaxed">
              Businesses get liquidity. Investors earn yield.
            </p>
            <p className="text-sm text-gray-500 max-w-xl mx-auto">
              A decentralized invoice marketplace on Stellar — upload invoices, get funded, earn returns.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              className="bg-white text-black px-10 py-4 rounded-full font-semibold text-lg hover:bg-gray-200 transition-all duration-200 active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.08)] disabled:opacity-50"
              onClick={onLaunch}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting Wallet...
                </span>
              ) : (
                'Launch App →'
              )}
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              Stellar Testnet
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              Multi-Wallet Support
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
              8-12% Yield
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
