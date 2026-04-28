import React, { Component, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getAddress } from "@stellar/freighter-api";
import * as StellarSdk from "@stellar/stellar-sdk";
import { LoadingScreen } from "./components/LoadingScreen";
import Web3HeroLanding from "./components/Web3HeroLanding";
import { FintrixAssistant, triggerChatNotification } from "./components/FintrixAssistant";
import DashboardView from "./components/DashboardView";
import MarketplaceView from "./components/MarketplaceView";
import DealDetailView from "./components/DealDetailView";
import SimulationFlow from "./components/SimulationFlow";
import ResourcesView from "./components/ResourcesView";
import WalletSelector from "./components/WalletSelector";
import WalletConnectModal from "./components/WalletConnectModal";
import FundingSuccess from "./components/FundingSuccess";
import RepaymentComplete from "./components/RepaymentComplete";
import {
  connectFreighterWallet,
  connectManualWallet,
  createInvoice,
  fundInvoiceOnBackend,
  getAccountBalance,
  getInvoices,
  repayInvoiceOnBackend,
} from "./services/stellarService";
import type { WalletProvider } from "./types";
import { ConnectedWallet, Invoice } from "./types";
import { useViewport } from "./hooks/useViewport";

type AppView =
  | "loading"
  | "landing"
  | "wallet"
  | "dashboard"
  | "marketplace"
  | "deal-detail"
  | "simulation"
  | "resources"
  | "funding-success"
  | "repayment";

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; msg: string }
> {
  declare props: { children: React.ReactNode };
  state = { hasError: false, msg: "" };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, msg: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[Fintrix ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#000", color: "#fff", fontFamily: "Inter, sans-serif", gap: "1.5rem", padding: "2rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Fintrix encountered a problem</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: "480px", fontSize: "0.875rem" }}>
            {this.state.msg || "An unexpected error occurred. Please reload."}
          </p>
          <button onClick={() => window.location.reload()} style={{ background: "#fff", color: "#000", border: "none", borderRadius: "9999px", padding: "0.75rem 2rem", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function Toast({ message, onDone, isMobile }: { message: string; onDone: () => void; isMobile: boolean }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 14 }}
      style={{
        position: "fixed",
        bottom: isMobile ? "1rem" : "1.5rem",
        right: isMobile ? "1rem" : "1.5rem",
        left: isMobile ? "1rem" : "auto",
        zIndex: 200,
        background: "rgba(17,17,17,0.97)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "0.75rem",
        padding: "0.75rem 1.25rem",
        fontSize: "0.875rem",
        color: "#fff",
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        maxWidth: isMobile ? "none" : "320px",
      }}
    >
      {message}
    </motion.div>
  );
}

function Sidebar({
  view,
  setView,
  wallet,
  open,
  setOpen,
  onLogout,
  isMobile,
}: {
  view: AppView;
  setView: (view: AppView) => void;
  wallet: string | null;
  open: boolean;
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  onLogout: () => void;
  isMobile: boolean;
}) {
  const [walletInfo, setWalletInfo] = useState<{
    address: string;
    shortAddress: string;
    xlmBalance: string;
  } | null>(null);

  useEffect(() => {
    async function fetchWalletInfo() {
      if (!wallet) {
        setWalletInfo(null);
        return;
      }

      try {
        const result = await getAddress().catch(() => ({ address: wallet }));
        const address = result?.address || wallet;
        if (!address) {
          setWalletInfo(null);
          return;
        }

        const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
        let xlmBalance = "—";
        try {
          const account = await server.loadAccount(address);
          const native = account.balances.find((balance: any) => balance.asset_type === "native");
          xlmBalance = native ? `${parseFloat(native.balance).toFixed(0)} XLM` : "0 XLM";
        } catch {
          xlmBalance = "Not funded";
        }

        setWalletInfo({
          address,
          shortAddress: `${address.slice(0, 6)}...${address.slice(-4)}`,
          xlmBalance,
        });
      } catch {
        setWalletInfo(null);
      }
    }

    void fetchWalletInfo();
    const interval = window.setInterval(() => {
      void fetchWalletInfo();
    }, 30000);

    return () => window.clearInterval(interval);
  }, [wallet]);

  const navItems = [
    { id: "dashboard" as const, label: "Dashboard", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> },
    { id: "simulation" as const, label: "Simulation", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg> },
    { id: "marketplace" as const, label: "Marketplace", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg> },
    { id: "deal-detail" as const, label: "Deals", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
    { id: "resources" as const, label: "Resources", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg> },
  ] as const;

  return (
    <>
      {isMobile && open ? (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 49, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        />
      ) : null}

      <aside
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          width: isMobile ? "17rem" : open ? "16rem" : "4.5rem",
          background: "#000",
          borderRight: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          flexDirection: "column",
          padding: isMobile || open ? "2rem 1.5rem" : "2rem 0.75rem",
          zIndex: 50,
          transition: "transform 0.28s cubic-bezier(.4,0,.2,1), width 0.28s cubic-bezier(.4,0,.2,1), padding 0.28s cubic-bezier(.4,0,.2,1)",
          overflow: "hidden",
          boxShadow: "4px 0 24px rgba(0,0,0,0.6)",
          transform: isMobile ? `translateX(${open ? "0" : "-100%"})` : "translateX(0)",
        }}
      >
        <div onClick={() => { setView("landing"); if (isMobile) setOpen(false); }} style={{ marginBottom: "2.5rem", display: "flex", alignItems: "center", gap: "0.875rem", overflow: "hidden", whiteSpace: "nowrap", cursor: "pointer" }}>
          <img src="/fintrix-brand.png" alt="Fintrix" style={{ height: "40px", width: "auto", flexShrink: 0 }} />
          {(open || isMobile) && <span style={{ fontWeight: 900, fontSize: "1.5rem", color: "#fff", letterSpacing: "-0.04em" }}>Fintrix</span>}
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item) => {
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  if (isMobile) setOpen(false);
                }}
                title={!open && !isMobile ? item.label : undefined}
                style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: open || isMobile ? "0.625rem 0.875rem" : "0.625rem", borderRadius: "0.5rem", borderLeft: `2px solid ${active ? "#0066FF" : "transparent"}`, background: active ? "rgba(255,255,255,0.06)" : "transparent", color: active ? "#fff" : "rgba(255,255,255,0.38)", fontWeight: active ? 600 : 400, fontSize: "0.875rem", cursor: "pointer", border: "none", width: "100%", textAlign: "left", transition: "all 0.2s", whiteSpace: "nowrap", overflow: "hidden", justifyContent: open || isMobile ? "flex-start" : "center", fontFamily: "Inter, sans-serif" }}
              >
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", flexShrink: 0 }}>{item.icon}</span>
                {(open || isMobile) && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {wallet ? (
            <>
              {walletInfo ? (
                <div style={{ padding: "10px 12px", background: "#0f172a", borderRadius: "8px", border: "1px solid #1e293b" }}>
                  {(open || isMobile) ? (
                    <>
                      <p style={{ color: "#9ca3af", fontSize: "0.65rem", marginBottom: "2px" }}>CONNECTED</p>
                      <p style={{ color: "#e2e8f0", fontSize: "0.78rem", fontFamily: "monospace" }}>
                        {walletInfo.shortAddress}
                      </p>
                      <p style={{ color: "#4ade80", fontSize: "0.72rem", marginTop: "2px" }}>
                        {walletInfo.xlmBalance}
                      </p>
                    </>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "38px", color: "#4ade80", fontSize: "0.72rem", fontWeight: 700 }}>
                      {walletInfo.shortAddress.slice(0, 2)}
                    </div>
                  )}
                </div>
              ) : null}
              <button onClick={onLogout} title="Disconnect" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0.75rem", color: "rgba(255,85,85,0.8)", fontSize: "0.875rem", cursor: "pointer", background: "transparent", border: "none", width: "100%", justifyContent: open || isMobile ? "flex-start" : "center", fontFamily: "Inter, sans-serif", borderRadius: "0.5rem", transition: "all 0.2s" }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "16px", height: "16px", flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </span>
                {(open || isMobile) && <span>Disconnect</span>}
              </button>
            </>
          ) : (
            <button onClick={() => { setView("wallet"); if (isMobile) setOpen(false); }} title="Connect Wallet" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0.75rem", color: "rgba(255,255,255,0.35)", fontSize: "0.875rem", cursor: "pointer", background: "transparent", border: "none", width: "100%", justifyContent: open || isMobile ? "flex-start" : "center", fontFamily: "Inter, sans-serif" }}>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "16px", height: "16px", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>
              </span>
              {(open || isMobile) && <span>Connect Wallet</span>}
            </button>
          )}
        </div>
      </aside>

      <button
        onClick={() => setOpen((prev) => !prev)}
        title={open ? "Collapse sidebar" : "Expand sidebar"}
        style={{ position: "fixed", left: isMobile ? "1rem" : open ? "calc(16rem - 16px)" : "calc(4.5rem - 16px)", top: isMobile ? "1rem" : "50%", transform: isMobile ? "none" : "translateY(-50%)", zIndex: 51, width: "32px", height: "32px", borderRadius: "50%", background: "#111", border: "1px solid rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.6)", transition: "left 0.28s cubic-bezier(.4,0,.2,1)", boxShadow: "0 2px 16px rgba(0,0,0,0.6)" }}
      >
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "16px", height: "16px", transform: open ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.28s ease" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </span>
      </button>
    </>
  );
}

export default function App() {
  const { isMobile } = useViewport();
  const [appView, setAppView] = useState<AppView>("loading");
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [lastFundedInvoice, setLastFundedInvoice] = useState<Invoice | null>(null);
  const [lastFundedAmount, setLastFundedAmount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [walletBalance, setWalletBalance] = useState(0);
  const [chatNotification, setChatNotification] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (appView === "loading") {
      document.body.classList.add("loading-screen");
    } else {
      document.body.classList.remove("loading-screen");
    }
    return () => document.body.classList.remove("loading-screen");
  }, [appView]);

  useEffect(() => {
    const authViews: AppView[] = ["dashboard", "marketplace", "deal-detail", "simulation", "resources"];
    if (authViews.includes(appView)) {
      getInvoices().then((data) => setInvoices(data ?? [])).catch((error) => console.warn("[Fintrix] getInvoices:", error));
    }
  }, [appView]);

  useEffect(() => {
    if (!wallet?.publicKey) {
      setWalletBalance(0);
      return;
    }
    getAccountBalance(wallet.publicKey).then(setWalletBalance).catch(() => setWalletBalance(0));
  }, [wallet?.publicKey]);

  const showToast = (message: string) => setToast(message);

  const navigate = (view: AppView) => {
    const protectedViews: AppView[] = ["dashboard", "marketplace", "deal-detail", "simulation", "resources"];
    if (protectedViews.includes(view) && !wallet) {
      setAppView("wallet");
      return;
    }
    if (isMobile) {
      setSidebarOpen(false);
    }
    setAppView(view);
  };

  const handleConnect = async (provider: "freighter" | "albedo", publicKey?: string) => {
    const connected = provider === "freighter"
      ? await connectFreighterWallet()
      : await connectManualWallet(provider as WalletProvider, publicKey);
    setWallet(connected);
    getAccountBalance(connected.publicKey).then(setWalletBalance).catch(() => setWalletBalance(0));
    showToast(`Connected: ${connected.publicKey.slice(0, 8)}...`);
    setAppView("dashboard");
  };

  const handleLogout = () => {
    // FIX 1: clear all wallet-related state and storage, then notify user
    try {
      setWallet(null);
      setWalletBalance(0);
      setAppView("landing");

      // Clear any persisted wallet keys if present
      try { localStorage.removeItem('walletAddress'); } catch {}
      try { localStorage.removeItem('fintrix_wallet'); } catch {}
      try { sessionStorage.clear(); } catch {}

      // Show ephemeral disconnect notification (red) without changing existing Toast API
      const el = document.createElement('div');
      el.className = 'fixed top-5 right-5 z-[9999] flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/15 border border-red-500/40 text-red-400 text-sm font-medium shadow-lg';
      el.innerHTML = `<span class="w-2 h-2 rounded-full bg-red-400"></span> Wallet disconnected`;
      document.body.appendChild(el);
      setTimeout(() => { el.classList.add('opacity-0'); setTimeout(() => el.remove(), 300); }, 3000);
    } catch (err) {
      console.warn('[Fintrix] logout cleanup failed', err);
      setWallet(null);
      setWalletBalance(0);
      setAppView('landing');
    }
  };

  const handleLandingConnect = async () => {
    if (wallet) {
      setAppView("dashboard");
      return;
    }
    setShowWalletModal(true);
  };

  const handleLandingSimulation = () => {
    if (!wallet) return false;
    setAppView("simulation");
    return true;
  };

  const handleFund = async (invoiceId: string, amount?: number) => {
    try {
      if (!wallet) {
        showToast("Connect wallet to invest");
        setAppView("wallet");
        return;
      }

      const updatedInv = await fundInvoiceOnBackend(invoiceId, wallet.publicKey, wallet.provider, amount);
      if (!updatedInv.txHash) {
        throw new Error("Funding was not confirmed by Stellar. Please try again.");
      }

      const fundedAmount = amount ?? updatedInv.amount;
      showToast("Transaction confirmed on-chain!");
      setChatNotification(`Invoice ${invoiceId} was successfully funded! Transaction hash: ${updatedInv.txHash}.`);
      const updatedList = await getInvoices().catch(() => invoices);
      setInvoices(updatedList ?? []);
      setLastFundedInvoice(updatedInv);
      setLastFundedAmount(fundedAmount);
      return updatedInv;
    } catch (error: any) {
      console.error("[Fintrix] handleFund error:", error);
      showToast(`Funding failed: ${error.message}`);
      throw error;
    }
  };

  const handleCreateInvoice = async (data: { amount: string; dueDate: string; buyer: string; invoiceId: string; companyName: string; industry: string; country: string }) => {
    const created = await createInvoice({
      amount: parseFloat(data.amount) || 0,
      due: data.dueDate,
      buyer: data.buyer,
      number: data.invoiceId,
      discount: 8,
      seller: wallet?.publicKey ?? "demo",
      notes: "",
      companyName: data.companyName,
      industry: data.industry,
      country: data.country,
    });
    setInvoices((prev) => [created, ...prev]);
    setSelectedInvoice(created);
    triggerChatNotification(
      "AI Verification complete for this invoice. Risk Level: LOW. Trust Score: 82/100. " +
      "Key indicators: Fixed repayment timeline, Tier-1 supplier, short-term exposure only. " +
      "Invoice is marketplace-ready."
    );
    return created;
  };

  void handleCreateInvoice;

  const handleViewDetail = (invoiceId: string) => {
    setSelectedInvoice(invoices.find((invoice) => invoice.id === invoiceId) ?? null);
    setAppView("deal-detail");
  };

  const handleRepay = async (invoiceId: string) => {
    await repayInvoiceOnBackend(invoiceId);
    showToast("Repayment complete!");
    const updated = await getInvoices().catch(() => invoices);
    setInvoices(updated ?? []);
    const invoice = invoices.find((item) => item.id === invoiceId);
    if (invoice) setLastFundedInvoice(invoice);
    setAppView("repayment");
  };

  void handleRepay;

  if (appView === "loading") {
    return (
      <AnimatePresence>
        <LoadingScreen onComplete={() => setAppView("landing")} />
      </AnimatePresence>
    );
  }

  if (appView === "landing") {
    return (
      <ErrorBoundary>
        <Web3HeroLanding onLaunch={handleLandingConnect} onStartSimulation={handleLandingSimulation} walletConnected={Boolean(wallet)} />
        <WalletConnectModal
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          setWalletAddress={() => {}}
          onProviderConnected={async (provider, address) => {
            try {
              const connected = provider === "freighter"
                ? await connectFreighterWallet()
                : await connectManualWallet(provider as WalletProvider, address);
              setWallet(connected);
              getAccountBalance(connected.publicKey).then(setWalletBalance).catch(() => setWalletBalance(0));
              showToast(`Connected: ${connected.publicKey.slice(0, 8)}...`);
              setShowWalletModal(false);
              setAppView("dashboard");
            } catch (error: any) {
              showToast(error?.message || "Wallet connection failed");
            }
          }}
        />
        <AnimatePresence>{toast && <Toast message={toast} onDone={() => setToast(null)} isMobile={isMobile} />}</AnimatePresence>
      </ErrorBoundary>
    );
  }

  // Wallet selector is rendered as an overlay modal on top of the current view

  if (appView === "funding-success") {
    return (
      <ErrorBoundary>
        <FundingSuccess
          invoice={lastFundedInvoice ? { buyer: lastFundedInvoice.buyer, amount: lastFundedInvoice.amount, duration: 45, txId: lastFundedInvoice.txHash } : null}
          amountInvested={lastFundedAmount}
          onViewInvestment={() => setAppView("deal-detail")}
          onExploreMore={() => setAppView("marketplace")}
        />
        <AnimatePresence>{toast && <Toast message={toast} onDone={() => setToast(null)} isMobile={isMobile} />}</AnimatePresence>
      </ErrorBoundary>
    );
  }

  if (appView === "repayment") {
    return (
      <ErrorBoundary>
        <RepaymentComplete
          invoice={lastFundedInvoice ? { buyer: lastFundedInvoice.buyer, amount: lastFundedInvoice.amount, txId: `0x${Math.random().toString(16).slice(2, 8)}...`, completedDate: new Date().toISOString().split("T")[0] } : null}
          amountInvested={lastFundedAmount}
          onReinvest={() => setAppView("marketplace")}
          onViewDetails={() => setAppView("deal-detail")}
        />
        <AnimatePresence>{toast && <Toast message={toast} onDone={() => setToast(null)} isMobile={isMobile} />}</AnimatePresence>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Sidebar
        view={appView}
        setView={navigate}
        wallet={wallet?.publicKey ?? null}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        onLogout={handleLogout}
        isMobile={isMobile}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={appView}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ minHeight: "100vh" }}
        >
          {appView === "dashboard" && (
            <DashboardView
              wallet={wallet?.publicKey ?? null}
              invoices={invoices}
              onNavigate={(view) => navigate(view as AppView)}
              onUpload={() => navigate("simulation")}
              onWallet={() => setAppView("wallet")}
              sidebarOpen={isMobile ? false : sidebarOpen}
            />
          )}

          {appView === "marketplace" && (
            <MarketplaceView
              invoices={invoices}
              onFund={async (id) => { await handleFund(id); }}
              onViewDetail={handleViewDetail}
              sidebarOpen={isMobile ? false : sidebarOpen}
            />
          )}

          {appView === "deal-detail" && (
            <DealDetailView
              invoice={selectedInvoice}
              wallet={wallet?.publicKey ?? null}
              onFund={async (id, amount) => handleFund(id, amount)}
              onBack={() => setAppView("marketplace")}
              sidebarOpen={isMobile ? false : sidebarOpen}
            />
          )}

          {appView === "simulation" && (
            <SimulationFlow
              invoices={invoices}
              sidebarOpen={isMobile ? false : sidebarOpen}
              walletAddress={wallet?.publicKey ?? null}
            />
          )}

          {appView === "resources" && <ResourcesView sidebarOpen={isMobile ? false : sidebarOpen} />}
        </motion.div>
      </AnimatePresence>

      <FintrixAssistant
        view={appView}
        walletAddress={wallet?.publicKey ?? null}
        walletBalance={walletBalance}
        invoices={invoices}
        currentDeal={selectedInvoice}
        notification={chatNotification}
      />

      {appView === "wallet" && (
        <WalletSelector onConnect={handleConnect} onClose={() => setAppView(wallet ? "dashboard" : "landing")} />
      )}

      <AnimatePresence>{toast && <Toast message={toast} onDone={() => setToast(null)} isMobile={isMobile} />}</AnimatePresence>
    </ErrorBoundary>
  );
}
