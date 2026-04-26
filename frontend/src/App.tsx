import React, { useEffect, useMemo, useState, Component, useRef } from "react";
import { LoadingScreen } from "./components/LoadingScreen";
import Web3HeroLanding from "./components/Web3HeroLanding";
import { AnimatePresence, motion, useMotionValue, useMotionTemplate } from "motion/react";
import { Activity, ArrowRight, BriefcaseBusiness, ChartNoAxesCombined, ChevronDown, ChevronRight, Clock3, FileSpreadsheet, LayoutGrid, LoaderCircle, ShieldCheck, Upload, Wallet, Database, ArrowUpRight, Rocket, Lock, Key, Link2, X, Zap } from "lucide-react";
import { FintrixAssistant } from "./components/FintrixAssistant";
import { cn, formatAddress, formatDate } from "./lib/utils";
import { parseInvoiceWithAI } from "./services/aiService";
import { buildSorobanEscrowPreview, confirmFreighterAction, connectFreighterWallet, connectManualWallet, createInvoice, fundInvoiceOnBackend, getAccountBalance, getInvoices, getNetworkSummary, getTransactions, repayInvoiceOnBackend } from "./services/stellarService";
import { ConnectedWallet, Invoice, InvoiceDraft, InvoiceStatus, Transaction, UserState } from "./types";

// ─── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; errorMessage: string }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[Fintrix ErrorBoundary]", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0B] text-white p-8 text-center gap-6">
          <img src="/logo.png" alt="Fintrix" className="w-16 h-16 rounded-full mb-2" />
          <h1 className="text-2xl font-bold">Fintrix encountered a problem</h1>
          <p className="text-white/50 max-w-md text-sm">{this.state.errorMessage || "An unexpected error occurred. Please reload the page."}</p>
          <button onClick={() => window.location.reload()} className="mt-4 rounded-full bg-white px-8 py-3 text-sm font-bold text-black hover:bg-white/90 transition-colors">Reload Application</button>
        </div>
      );
    }
    return this.props.children;
  }
}
// ───────────────────────────────────────────────────────────────────────────────

type AppView = "landing" | "dashboard" | "marketplace" | "upload" | "portfolio" | "activity";
type WalletOption = "freighter" | "albedo";
type Performer = { id: string; wallet: string; name: string; pfp: string; roi: number; sharpe: number; wins: number };

const defaultDraft: InvoiceDraft = { amount: "", dueDate: "", buyer: "", number: "", discount: 7, notes: "" };

const navItems: Array<{ id: AppView; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "marketplace", label: "Marketplace", icon: BriefcaseBusiness },
  { id: "upload", label: "Create Simulation", icon: Upload },
  { id: "portfolio", label: "Portfolio", icon: ChartNoAxesCombined },
  { id: "activity", label: "Activity", icon: Activity },
];

const FINTRIX_WORDMARK_CLASS = "font-headline font-black tracking-tighter text-white";

function FintrixBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/logo.png"
        className={cn(
          "rounded-full object-cover border border-white/5",
          compact ? "w-9 h-9" : "w-[44px] h-[44px]"
        )}
        alt="Fintrix Logo"
      />
      <div className="leading-none">
        <p className={cn(FINTRIX_WORDMARK_CLASS, compact ? "text-sm" : "text-base")}>Fintrix</p>
        {!compact && <p className="mt-0.5 text-[9px] uppercase tracking-[0.3em] text-white/40">Institutional</p>}
      </div>
    </div>
  );
}

const Toast = ({ message }: { message: string }) => (
  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 14 }} className="fixed bottom-6 right-6 z-[100] rounded-2xl border border-white/10 bg-[#111]/95 px-4 py-3 text-sm text-white shadow-2xl">
    {message}
  </motion.div>
);

function WalletModal({ open, busy, onConnect, onClose }: { open: boolean; busy: WalletOption | null; onConnect: (provider: WalletOption, publicKey?: string) => Promise<void>; onClose: () => void }) {
  const [albedoKey, setAlbedoKey] = useState("");
  const [showAlbedoInput, setShowAlbedoInput] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black text-white flex flex-col font-sans">
      <button onClick={onClose} className="absolute right-8 top-8 text-[#c6c6c6]/50 hover:text-white transition-colors">
        <X size={24} />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="flex flex-col items-center mb-16 text-center">
          {/* Logo representation of Image 2 & sphere */}
          <img
            src="/logo.png"
            alt="Fintrix Logo"
            className="mb-8 h-[90px] w-[90px] rounded-full object-cover shadow-[0_0_50px_rgba(59,130,246,0.1)] border border-white/10"
          />
          <span className="mb-5 text-[10px] font-bold uppercase tracking-[0.3em] text-[#c6c6c6]/40">
            Authentication Portal
          </span>
          <h2 className="font-headline text-5xl font-extrabold tracking-tight text-white md:text-6xl mb-4">
            Initialize Connection
          </h2>
          <p className="max-w-md text-[17px] leading-relaxed text-[#c6c6c6]/60">
            Connect your wallet to enter the Fintrix simulation.
          </p>
        </div>

        <div className="grid w-full max-w-[800px] grid-cols-1 gap-6 md:grid-cols-2">
          {/* Freighter Card */}
          <div className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#141414] p-10 text-left transition-all hover:bg-[#1a1a1a] hover:border-white/10 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col justify-between">
            <div className="absolute right-8 top-8 opacity-[0.03] transition-transform duration-500 group-hover:scale-110">
              <Wallet size={80} className="text-white" />
            </div>
            <div>
              <div className="mb-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10">
                <Rocket size={18} className="text-white relative z-10" />
              </div>
              <h3 className="mb-3 font-headline text-2xl font-bold text-white relative z-10">Connect Freighter</h3>
              <p className="mb-12 text-sm leading-relaxed text-[#c6c6c6]/50 relative z-10 pr-4">
                A secure browser extension for the Stellar network with advanced institutional controls.
              </p>
            </div>
            <button disabled={busy !== null} onClick={() => void onConnect("freighter")} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#c6c6c6]/70 transition-colors group-hover:text-white relative z-10 focus:outline-none text-left">
              {busy === "freighter" ? "CONNECTING..." : "INITIALIZE"} <ArrowRight size={14} />
            </button>
          </div>

          {/* Albedo Card */}
          <div className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#141414] p-10 text-left transition-all hover:bg-[#1a1a1a] hover:border-white/10 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col justify-between">
            <div className="absolute right-8 top-8 opacity-[0.03] transition-transform duration-500 group-hover:scale-110">
              <Key size={80} className="text-white" />
            </div>
            <div>
              <div className="mb-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10">
                <Link2 size={18} className="text-white relative z-10" />
              </div>
              <h3 className="mb-3 font-headline text-2xl font-bold text-white relative z-10">Albedo Wallet</h3>
              <p className="mb-8 text-sm leading-relaxed text-[#c6c6c6]/50 relative z-10 pr-4">
                Connect using Albedo — a browser-based Stellar wallet. No extension needed.
              </p>
            </div>

            {!showAlbedoInput ? (
              <button onClick={() => { window.open("https://albedo.link", "_blank"); setShowAlbedoInput(true); }} disabled={busy !== null} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#c6c6c6]/70 transition-colors hover:text-white relative z-10 mt-auto focus:outline-none text-left">
                {busy === "albedo" ? "CONNECTING..." : "INITIALIZE"} <ArrowRight size={14} />
              </button>
            ) : (
              <div className="relative z-10 flex gap-2 w-full mt-auto">
                <input autoFocus value={albedoKey} onChange={(e) => setAlbedoKey(e.target.value)} placeholder="Paste public key..." className="bg-black/50 border border-white/10 rounded-full pl-4 pr-3 py-2.5 text-xs text-white outline-none focus:border-white/30 w-full font-mono placeholder:font-sans placeholder:text-white/20" />
                <button onClick={() => void onConnect("albedo", albedoKey)} className="bg-white text-black px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-white/90 whitespace-nowrap transition-colors">GO</button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-20 flex items-center justify-center">
          <div className="flex flex-row items-center gap-3 rounded-full border border-white/5 bg-[#0a0a0a] px-6 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
            <Lock size={12} className="text-[#c6c6c6]/40" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c6c6c6]/40 pt-0.5">
              Secure Encryption Enabled
            </span>
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-white/5 bg-[#141414]/30 px-8 py-8 md:px-16">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 md:flex-row md:items-end">
          <div className="text-center md:text-left">
            <div className="mb-2 font-headline text-lg font-bold text-white">Fintrix Institutional</div>
            <p className="text-[9px] uppercase tracking-widest text-[#c6c6c6]/30">
              © 2024 FINTRIX INSTITUTIONAL. ALL RIGHTS RESERVED.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 text-[10px] font-bold uppercase tracking-[0.14em] text-[#c6c6c6]/40 md:justify-end">
            <button className="transition hover:text-white">Privacy Policy</button>
            <button className="transition hover:text-white">Terms of Service</button>
            <button className="transition hover:text-white">Security</button>
            <div className="flex items-center gap-2 rounded-full border border-white/5 bg-black/40 px-3 py-1.5 ml-0 md:ml-4">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c6c6c6]/40 shadow-[0_0_8px_rgba(255,255,255,0.1)]" />
              <span className="text-[#c6c6c6]/60">Status: Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function Landing({ wallet, metrics, featuredInvoices, transactions, onWallet, onCreate, onNavigate }: { wallet: ConnectedWallet | null; metrics: Array<{ label: string; value: string | number; hint: string }>; featuredInvoices: Invoice[]; transactions: Transaction[]; onWallet: () => void; onCreate: () => void; onNavigate: (view: AppView) => void }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const navItems = [
    { label: "Dashboard", target: "dashboard" as AppView },
    { label: "Marketplace", target: "marketplace" as AppView },
    { label: "Simulation", target: "upload" as AppView },
    { label: "Resources", target: "activity" as AppView },
  ];

  const previewCards = [
    {
      company: featuredInvoices[0]?.buyer ?? "CloudStream Inc.",
      risk: "Low Risk",
      value: "$45,000",
      roi: "12.4%",
      term: "60 Days",
      funded: "78% Funded",
      raised: "$35,100",
      width: "78%",
      tone: "bg-green-500/10 text-green-400",
    },
    {
      company: featuredInvoices[1]?.buyer ?? "Atlas Logistics",
      risk: "Med Risk",
      value: "$122,000",
      roi: "14.8%",
      term: "90 Days",
      funded: "42% Funded",
      raised: "$51,240",
      width: "42%",
      tone: "bg-yellow-500/10 text-yellow-400",
    },
    {
      company: featuredInvoices[2]?.buyer ?? "Vertex Energy",
      risk: "Low Risk",
      value: "$88,500",
      roi: "11.9%",
      term: "45 Days",
      funded: "95% Funded",
      raised: "$84,075",
      width: "95%",
      tone: "bg-green-500/10 text-green-400",
    },
  ];

  const roadmap = [
    {
      title: "Upload Invoice",
      status: "Verification: 100%",
      description: "Submit real or test invoices to the Fintrix dashboard for AI data extraction.",
      metaA: "PHASE: 1",
      metaB: "STATUS: ACTIVE",
      icon: Upload,
      side: "left" as const,
      shift: "",
      accent: "text-blue-400",
    },
    {
      title: "AI Parsing",
      status: "Processing",
      description: "Extracting amount, dates, and buyer information automatically using generative AI.",
      metaA: "MODEL: GEMINI",
      metaB: "SPEED: FAST",
      icon: FileSpreadsheet,
      side: "right" as const,
      shift: "",
      accent: "text-purple-400",
    },
    {
      title: "Marketplace Listing",
      status: "Queue: Instant",
      description: "Automated listing on our testnet liquidity marketplace for funding simulation.",
      metaA: "NETWORK: TESTNET",
      metaB: "STATE: LISTED",
      icon: BriefcaseBusiness,
      side: "left" as const,
      shift: "",
      accent: "text-emerald-400",
    },
    {
      title: "Funding & Smart Contract",
      status: "Escrow: Active",
      description: "Capital deposited via Freighter or Albedo is secured using Soroban testing contracts.",
      metaA: "CHAIN: STELLAR",
      metaB: "TOKEN: XLM",
      icon: Wallet,
      side: "right" as const,
      shift: "",
      accent: "text-yellow-400",
    },
    {
      title: "Repayment Simulation",
      status: "Cycle: Complete",
      description: "Simulate the settlement and yield distribution to validate the financing loop.",
      metaA: "YIELD: REAL-TIME",
      metaB: "RECUR: DEMO",
      icon: ArrowRight,
      side: "left" as const,
      shift: "",
      accent: "text-white/60",
    },
  ];

  return (
    <div className="bg-black text-white">
      <nav className="fixed left-0 top-0 z-50 flex h-24 w-full items-center justify-between px-8 md:px-12 bg-transparent pointer-events-auto">
        <button onClick={() => onNavigate("landing")} className={cn(FINTRIX_WORDMARK_CLASS, "text-2xl")}>
          Fintrix
        </button>
        <div className="hidden gap-10 md:flex items-center">
          {navItems.map((item, index) => (
            <button
              key={item.label}
              onClick={() => onNavigate(item.target)}
              className={cn(
                "font-headline text-sm font-semibold transition-all duration-300 ease-in-out",
                index === 0 ? "text-white" : "text-white/60 hover:text-white",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div />
      </nav>

      <main>
        <section onMouseMove={handleMouseMove} className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden group">
          <motion.div
            className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 mix-blend-screen z-20"
            style={{
              background: useMotionTemplate`
                radial-gradient(
                  400px circle at ${mouseX}px ${mouseY}px,
                  rgba(59, 130, 246, 0.15),
                  transparent 80%
                )
              `,
            }}
          />
          <div className="absolute inset-0 h-full w-full pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(59,130,246,0.18),transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_70%_30%,rgba(99,102,241,0.12),transparent_60%)]" />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent pointer-events-none" />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-5xl px-4 text-center mt-[-5vh]">
            <h1 className="mb-8 font-headline text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-8xl text-white">
              INVOICE FINANACE <br /> <span className="text-white/50">SIMULATION</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-[15px] leading-relaxed text-white/60 font-medium">
              Experience how real-world invoice financing works. Upload an invoice, parse it with AI, and fund it using Stellar testnet wallets.
            </p>
            <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onCreate} className="rounded-full bg-white px-8 py-4 font-headline text-sm font-bold text-black shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-shadow">
                Start Simulation
              </motion.button>
            </div>
          </motion.div>
        </section>

        <section className="bg-black px-8 py-24 relative z-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: FileSpreadsheet, label: "AI Extraction", value: "Real-time", text: "Upload invoices to automatically extract buyer names, amount, and due dates via AI." },
              { icon: ShieldCheck, label: "Stellar Escrow", value: "Soroban", text: "Simulate secure escrowing of XLM assets on the Stellar testnet." },
              { icon: LayoutGrid, label: "Marketplace", value: "Interactive", text: "Act as an exporter or investor in a functional peer-to-peer liquidity platform." },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} key={card.label} className="glass-panel group rounded-[1.8rem] p-8 transition-colors hover:border-blue-500/40">
                  <div className="mb-6 flex items-start justify-between">
                    <div className="rounded-lg bg-blue-500/10 p-3 ring-1 ring-blue-500/30">
                      <Icon size={24} className="text-blue-400" />
                    </div>
                  </div>
                  <div className="mb-2 font-headline text-4xl font-black text-white">{card.value}</div>
                  <div className="mb-3 text-xs font-bold uppercase tracking-widest text-[#c6c6c6]/80">{card.label}</div>
                  <p className="text-sm leading-relaxed text-[#c6c6c6]/60">{card.text}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="grid-bg relative overflow-hidden bg-black px-8 py-24 z-20">
          <div className="relative z-10 mx-auto mb-20 max-w-4xl text-center">
            <h2 className="mb-6 font-headline text-5xl font-extrabold tracking-tight text-white md:text-6xl">Architected for Trust</h2>
            <p className="mx-auto max-w-2xl text-lg text-[#c6c6c6]/70">A seamless simulation of traditional accounts receivable turning into on-chain yield, powered by Soroban and AI.</p>
          </div>

          <div className="relative mx-auto max-w-5xl px-4 md:px-0">
            <div className="absolute left-[36px] top-8 bottom-8 w-1 bg-gradient-to-b from-blue-500/10 via-blue-500 to-blue-500/10 md:left-1/2 md:-translate-x-1/2" />

            <div className="relative z-10 flex flex-col space-y-16">
              {roadmap.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} key={step.title} className={cn("relative flex items-center gap-8 md:w-1/2", step.side === "left" ? "md:pr-12 md:self-start md:flex-row-reverse" : "md:pl-12 md:self-end")}>
                    <div className={cn("absolute left-0 flex h-14 w-14 items-center justify-center rounded-full border-4 border-black bg-[linear-gradient(135deg,#3b82f6_0%,#60a5fa_100%)] shadow-[0_0_20px_rgba(59,130,246,0.5)] md:left-auto md:w-16 md:h-16", step.side === "left" ? "md:-right-8" : "md:-left-8")}>
                      <div className="h-4 w-4 rounded-full bg-white md:h-5 md:w-5" />
                    </div>

                    <div className="glass-panel w-full ml-16 md:ml-0 rounded-2xl p-8 transition-transform duration-500 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(59,130,246,0.15)]">
                      <div className="mb-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                          <Icon size={22} className={cn(step.accent)} />
                        </div>
                        <div>
                          <h3 className="font-headline text-xl font-bold text-white">{step.title}</h3>
                          <span className={cn("text-[10px] font-bold uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded bg-white/5 inline-block mt-1", step.accent)}>{step.status}</span>
                        </div>
                      </div>
                      <p className="mb-4 text-sm leading-relaxed text-[#c6c6c6]/70">{step.description}</p>
                      <div className="flex gap-4 border-t border-white/10 pt-4">
                        <div className="text-[10px] text-[#c6c6c6]/50 font-bold"><span className="text-white/30 mr-1">{step.metaA.split(':')[0]}:</span>{step.metaA.split(':')[1]}</div>
                        <div className="text-[10px] text-[#c6c6c6]/50 font-bold"><span className="text-white/30 mr-1">{step.metaB.split(':')[0]}:</span>{step.metaB.split(':')[1]}</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-black px-8 py-32 relative z-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 flex flex-col items-start justify-between gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end">
              <div>
                <h2 className="mb-2 font-headline text-4xl font-extrabold text-white">Marketplace Activity</h2>
                <p className="text-[#c6c6c6]/70">Explore active simulation invoices currently available for funding.</p>
              </div>
              <motion.button whileHover={{ x: 5 }} onClick={() => onNavigate("marketplace")} className="flex items-center gap-2 font-headline font-bold text-blue-500 transition-opacity hover:opacity-80">
                View Full Marketplace <ArrowRight size={18} />
              </motion.button>
            </div>
            {featuredInvoices.length > 0 ? (
              <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
                {featuredInvoices.slice(0, 3).map((invoice) => (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} key={invoice.id} onClick={() => onNavigate("marketplace")} className="glass-panel group cursor-pointer rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/40">
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#1f1f1f]">
                          <BriefcaseBusiness size={18} className="text-white/50" />
                        </div>
                        <span className="font-headline font-bold text-white group-hover:text-blue-200 transition-colors">{invoice.buyer}</span>
                      </div>
                      <span className={cn("rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-white/5 text-white/70 border border-white/10")}>Simulation</span>
                    </div>
                    <div className="mb-8 space-y-4">
                      <div className="flex justify-between text-sm"><span className="text-[#c6c6c6]/60">Invoice Value</span><span className="font-medium text-white">${invoice.amount.toLocaleString()}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-[#c6c6c6]/60">Simulation Yield</span><span className="font-bold text-blue-500">{invoice.yield}%</span></div>
                      <div className="flex justify-between text-sm"><span className="text-[#c6c6c6]/60">Term</span><span className="text-white">{formatDate(invoice.due)}</span></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#c6c6c6]/60">
                        <span>{invoice.status === 'funded' || invoice.status === 'repaid' ? '100% Funded' : '0% Funded'}</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                        <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: invoice.status === 'funded' || invoice.status === 'repaid' ? '100%' : '0%' }} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="glass-panel flex flex-col items-center justify-center rounded-3xl p-16 text-center lg:col-span-3 border border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
                <FileSpreadsheet size={48} className="mb-6 text-blue-500/50" />
                <h3 className="mb-2 font-headline text-2xl font-bold text-white">No active simulations</h3>
                <p className="mb-8 text-white/50 text-sm">Be the first to create and list an invoice simulation.</p>
                <button onClick={() => onNavigate("upload")} className="rounded-full bg-white px-8 py-3 text-sm font-bold text-black hover:bg-white/90 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">Create Simulation</button>
              </div>
            )}
          </div>
        </section>

        <section className="relative overflow-hidden bg-black py-48 z-20">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-[160px]" />
          </div>
          <div className="relative z-10 px-8 text-center">
            <h2 className="mb-8 font-headline text-5xl font-extrabold tracking-tighter text-white md:text-7xl">
              Join the Simulation
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-lg text-[#c6c6c6]/70">Experience the functional invoice financing workflow directly on the Stellar testnet.</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onCreate} className="button-glow rounded-full bg-white px-12 py-6 font-headline text-xl font-extrabold text-black transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Launch App
            </motion.button>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#0a0a0a] px-8 py-12 relative z-20">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between md:flex-row">
          <div className="mb-8 md:mb-0 text-center md:text-left">
            <div className={cn(FINTRIX_WORDMARK_CLASS, "mb-2 text-xl")}>Fintrix</div>
            <p className="text-[10px] uppercase tracking-widest text-[#c6c6c6]/50">Invoice Financing MVP on Stellar</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <button onClick={() => onNavigate("upload")} className="text-xs font-bold uppercase tracking-widest text-[#c6c6c6]/60 transition-colors hover:text-white">Run Simulation</button>
            <button onClick={() => window.open('https://stellar.org/soroban')} className="text-xs font-bold uppercase tracking-widest text-[#c6c6c6]/60 transition-colors hover:text-white">Learn Soroban</button>
          </div>
        </div>
      </footer>
    </div >
  );
}
function AppShell({ view, setView, wallet, network, onWallet, children }: { view: AppView; setView: (view: AppView) => void; wallet: ConnectedWallet | null; network: string; onWallet: () => void; children: React.ReactNode }) {
  const navItems = [
    { label: "DASHBOARD", short: "Home", target: "dashboard" as AppView, icon: LayoutGrid },
    { label: "MARKETPLACE", short: "Market", target: "marketplace" as AppView, icon: BriefcaseBusiness },
    { label: "SIMULATION", short: "Sim", target: "upload" as AppView, icon: Upload },
    { label: "RESOURCES", short: "Activity", target: "activity" as AppView, icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col font-sans">
      <header className="sticky top-0 z-50 flex h-20 w-full items-center justify-between border-b border-white/5 bg-[#0A0A0B]/90 px-4 backdrop-blur-xl md:px-10">
        <button onClick={() => setView("landing")} className="flex items-center">
          <FintrixBrand compact />
        </button>
        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-10 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setView(item.target)}
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.15em] transition-all h-20 flex items-center border-b-2",
                view === item.target || (view === "portfolio" && item.target === "dashboard")
                  ? "border-white text-white"
                  : "border-transparent text-white/50 hover:text-white"
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <button onClick={onWallet} className="rounded-full bg-white px-4 py-2.5 text-[11px] font-bold text-black transition-transform hover:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.15)] md:px-6 md:text-xs">
            {wallet ? formatAddress(wallet.publicKey) : "Connect"}
          </button>
        </div>
      </header>
      <main className="flex-1 px-4 py-6 pb-24 md:px-10 md:py-10 md:pb-10 w-full max-w-[1400px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0A0A0B]/95 px-2 py-2 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = view === item.target || (view === "portfolio" && item.target === "dashboard");
            return (
              <button
                key={item.label}
                onClick={() => setView(item.target)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 transition-all",
                  active ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={16} />
                <span className="text-[10px] font-bold uppercase tracking-[0.08em]">{item.short}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function DashboardView({ wallet, user, invoices, onNavigate }: { wallet: ConnectedWallet | null; user: UserState; invoices: Invoice[]; onNavigate: (view: AppView) => void }) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  // Use real data; show portfolio stats derived from actual invoices
  const totalUSD = user.xlmBalance;
  const funded = invoices.filter(i => i.status === "funded" || i.status === "repaid");
  const activeInvoices = invoices.filter(i => i.status === "active" || i.status === "funded").slice(0, 4);
  const totalProfit = funded.length * 4200; // simulated ~4.2% APY per deal
  const activePositions = invoices.filter(i => i.status !== "repaid").length;

  function downloadPortfolioReport() {
    const headers = ["Invoice ID", "Buyer", "Amount", "Yield", "Status", "Due Date"];
    const rows = invoices.map((i) => [i.id, i.buyer, String(i.amount), `${i.yield}%`, i.status, i.due]);
    const csv = [headers, ...rows].map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "fintrix-portfolio-report.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return <div className="space-y-12 pb-16">
    <section className="flex flex-col gap-10 xl:flex-row xl:items-start xl:justify-between border-b mx-4 border-white/10 pb-12">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-3">Institutional Portfolio Overview</p>
        <div className="flex items-baseline gap-2">
          <h1 className="font-headline text-5xl font-black tracking-tighter md:text-[5.5rem] text-white">${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
          <span className="font-headline text-3xl font-black text-white/30">.00</span>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-12">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Total Deployed</p>
            <p className="text-2xl font-bold text-white">${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/10" />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Est. Profit</p>
            <p className="text-2xl font-bold text-white">+${totalProfit.toLocaleString()}</p>
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/10" />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Active Positions</p>
            <p className="text-2xl font-bold text-white">{activePositions}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 min-w-[240px]">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onNavigate("marketplace")} className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-bold text-black transition-all">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black/10">
            <span className="text-lg leading-none">+</span>
          </div>
          New Investment
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={downloadPortfolioReport} className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-transparent px-6 py-4 text-sm font-bold text-white transition-all hover:bg-white/5">
          <span className="text-lg leading-none">↓</span>
          Download Reports
        </motion.button>
      </div>
    </section>

    <section className="grid gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[1.5fr_320px_400px]">
      <div className="rounded-[24px] bg-[#0E0E10] p-8 border border-white/5 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h3 className="text-lg font-semibold text-white">Yield Velocity</h3>
            <p className="text-xs text-white/40 mt-1">Institutional yield performance vs baseline</p>
          </div>
          <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-[10px] font-bold text-blue-400">Monthly Avg: 4.2% APY</span>
        </div>
        <div className="flex items-end gap-3 h-40">
          {[40, 50, 45, 60, 55, 65, 100, 70, 75, 65, 80, 70].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.05, duration: 0.6, ease: "easeOut" }}
              onMouseEnter={() => setHoveredBar(i)}
              onMouseLeave={() => setHoveredBar(null)}
              className={cn(
                "flex-1 rounded-t-sm transition-all duration-200 cursor-pointer",
                hoveredBar === i ? "bg-blue-300 shadow-[0_0_22px_rgba(59,130,246,0.8)]" : i === 6 ? "bg-white shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "bg-white/10"
              )}
            />
          ))}
        </div>
      </div>

      <div className="rounded-[24px] bg-[#0E0E10] p-8 border border-white/5 flex flex-col items-center justify-center text-center">
        <div className="relative flex h-36 w-36 items-center justify-center">
          <svg className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="72" cy="72" r="64" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
            <motion.circle initial={{ strokeDashoffset: 402 }} animate={{ strokeDashoffset: 402 - (402 * 0.94) }} transition={{ duration: 1.5, ease: "easeOut" }} cx="72" cy="72" r="64" fill="none" stroke="#fff" strokeWidth="6" strokeDasharray="402" className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" strokeLinecap="round" />
          </svg>
          <span className="font-headline text-3xl font-black text-white">94%</span>
        </div>
        <h3 className="mt-8 text-lg font-semibold text-white">Portfolio Health</h3>
        <p className="mt-1 text-xs text-white/40">Optimal collateralization and diversification</p>
      </div>

      <div className="rounded-[24px] bg-[#0E0E10] p-8 border border-white/5 flex flex-col justify-between hidden xl:flex">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-base font-semibold text-white">Allocation</h3>
          <div className="h-6 w-6 rounded-full border-2 border-white/20 flex items-center justify-center"><div className="w-1/2 h-full bg-white/20 rounded-r-full" /></div>
        </div>
        <div className="space-y-6">
          <div className="flex justify-between items-center"><div className="flex items-center gap-3"><div className="h-2 w-2 rounded-full bg-white" /><span className="text-sm font-medium text-white/80">Fixed Yield</span></div><span className="font-bold text-white">62%</span></div>
          <div className="flex justify-between items-center"><div className="flex items-center gap-3"><div className="h-2 w-2 rounded-full bg-white/40" /><span className="text-sm font-medium text-white/80">Floating Rate</span></div><span className="font-bold text-white">24%</span></div>
          <div className="flex justify-between items-center"><div className="flex items-center gap-3"><div className="h-2 w-2 rounded-full bg-white/20" /><span className="text-sm font-medium text-white/80">Liquidity Pools</span></div><span className="font-bold text-white">14%</span></div>
        </div>
      </div>
    </section>

    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-headline text-2xl font-black text-white">Active Invoices</h2>
          <p className="text-xs text-white/40 mt-1">Real-time status of current funding positions</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[800px] border-y border-white/10 bg-[#0A0A0B]">
          <div className="grid grid-cols-5 px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
            <span>Reference ID</span>
            <span>Counterparty</span>
            <span>Amount (USD)</span>
            <span>Maturity</span>
            <span className="text-right">Status</span>
          </div>
          {activeInvoices.length > 0 ? activeInvoices.map((inv, idx) => (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={inv.id} className="grid grid-cols-5 items-center px-6 py-6 border-t border-white/5 transition-colors hover:bg-white/[0.02]">
              <span className="text-[11px] font-bold tracking-widest text-[#777]">{inv.id.replace('#', '')}</span>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[9px] font-bold text-white/60">{inv.buyer.substring(0, 2).toUpperCase()}</div>
                <span className="text-sm font-semibold text-white/90">{inv.buyer}</span>
              </div>
              <span className="text-sm font-bold text-white">${Number(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <span className="text-sm text-white/60">{formatDate(inv.due)}</span>
              <div className="text-right">
                <span className={cn("inline-block rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em]", inv.status === "active" ? "bg-white text-black" : inv.status === "funded" ? "bg-amber-500/20 text-amber-300" : "bg-white/10 text-white/40")}>{inv.status}</span>
              </div>
            </motion.div>
          )) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-5 flex flex-col items-center justify-center py-20 text-center gap-4">
              <img src="/logo.png" alt="" className="w-12 h-12 rounded-full opacity-30" />
              <p className="text-white/30 text-sm font-medium">No active positions yet</p>
              <p className="text-white/20 text-xs max-w-xs">Create a simulation on the Marketplace or upload an invoice to get started.</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  </div>;
}

function MarketplaceView({ invoices, onFund }: { invoices: Invoice[]; onFund: (id: string) => Promise<void> }) {
  const [statusTab, setStatusTab] = useState<InvoiceStatus | "all">("all");
  const [riskFilter, setRiskFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [minApy, setMinApy] = useState(0);
  const [maxDuration, setMaxDuration] = useState(120);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 500);
    return () => window.clearTimeout(timeout);
  }, []);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const byStatus = statusTab === "all" ? true : invoice.status === statusTab;
      const riskLevel = invoice.riskScore < 40 ? "low" : invoice.riskScore < 65 ? "medium" : "high";
      const byRisk = riskFilter === "all" ? true : riskLevel === riskFilter;
      const durationDays = Math.max(1, Math.ceil((new Date(invoice.due).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      const byApy = invoice.yield >= minApy;
      const byDuration = durationDays <= maxDuration;
      return byStatus && byRisk && byApy && byDuration;
    });
  }, [invoices, statusTab, riskFilter, minApy, maxDuration]);

  const totalVolume = useMemo(() => invoices.reduce((sum, invoice) => sum + invoice.amount, 0), [invoices]);
  const avgYield = useMemo(() => (invoices.length ? invoices.reduce((sum, invoice) => sum + invoice.yield, 0) / invoices.length : 0), [invoices]);

  return (
    <div className="space-y-10">
      <section className="grid gap-6 xl:grid-cols-[1fr_260px] xl:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-blue-400">Marketplace</p>
          <h1 className="mt-3 font-headline text-5xl font-black tracking-tight md:text-6xl text-white">Invoice Opportunities</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/50">
            Review active invoices, projected yield, and repayment timelines before funding.
          </p>
        </div>
        <div className="glass-panel rounded-3xl p-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">Protocol Volume (USD)</p>
          <p className="mt-2 font-headline text-4xl font-black text-white">${(totalVolume / 1_000_000).toFixed(1)}M</p>
          <p className="mt-1 text-sm font-semibold text-blue-300">+{(avgYield / 4).toFixed(1)}%</p>
        </div>
      </section>

      <section className="glass-panel rounded-3xl border border-white/10 p-4 md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2 rounded-full border border-white/10 bg-black/30 p-1.5">
            {(["all", "active", "funded", "repaid"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusTab(status)}
                className={cn(
                  "rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-all",
                  statusTab === status ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]" : "text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 rounded-full border border-white/10 bg-black/30 p-1.5">
            {([
              { id: "all", label: "All" },
              { id: "low", label: "Low" },
              { id: "medium", label: "Med" },
              { id: "high", label: "High" },
            ] as const).map((risk) => (
              <button
                key={risk.id}
                onClick={() => setRiskFilter(risk.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-all",
                  riskFilter === risk.id ? "bg-blue-500/20 text-blue-200 border border-blue-400/50" : "text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                {risk.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <label className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
              <span>Min Projected APY</span>
              <span className="text-blue-300">{minApy.toFixed(1)}%</span>
            </div>
            <input type="range" min={0} max={20} step={0.5} value={minApy} onChange={(event) => setMinApy(Number(event.target.value))} className="w-full accent-blue-500" />
          </label>
          <label className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
              <span>Max Duration</span>
              <span className="text-blue-300">{maxDuration} days</span>
            </div>
            <input type="range" min={15} max={180} step={5} value={maxDuration} onChange={(event) => setMaxDuration(Number(event.target.value))} className="w-full accent-blue-500" />
          </label>
        </div>
      </section>

      {isLoading ? (
        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="glass-panel animate-pulse rounded-[1.6rem] border border-white/10 p-6">
              <div className="h-3 w-20 rounded bg-white/10" />
              <div className="mt-4 h-10 w-36 rounded bg-white/10" />
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="h-12 rounded bg-white/10" />
                <div className="h-12 rounded bg-white/10" />
              </div>
              <div className="mt-6 h-2 rounded-full bg-white/10" />
              <div className="mt-6 h-10 rounded-full bg-white/10" />
            </div>
          ))}
        </section>
      ) : filteredInvoices.length === 0 ? (
        <section className="glass-panel flex min-h-[280px] flex-col items-center justify-center rounded-[2rem] border border-white/10 px-6 text-center">
          <Database size={38} className="text-blue-300/70" />
          <p className="mt-5 text-2xl font-bold text-white">No opportunities found</p>
          <p className="mt-2 max-w-md text-sm text-white/50">Try widening your APY, risk, or duration filters to view available invoice opportunities.</p>
        </section>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {filteredInvoices.map((invoice) => {
              const riskLevel = invoice.riskScore < 40 ? "low" : invoice.riskScore < 65 ? "medium" : "high";
              const durationDays = Math.max(1, Math.ceil((new Date(invoice.due).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
              const progress = invoice.status === "repaid" ? 100 : invoice.status === "funded" ? 100 : Math.max(invoice.funded || 0, 8);
              return (
                <motion.article
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  key={invoice.id}
                  className="glass-panel group rounded-[1.6rem] border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-6 transition-all hover:border-blue-400/50 hover:shadow-[0_12px_36px_-10px_rgba(59,130,246,0.35)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">{invoice.id}</p>
                      <h3 className="mt-3 font-headline text-4xl font-black text-white">${invoice.amount.toLocaleString()}</h3>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] border",
                        riskLevel === "low"
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/40"
                          : riskLevel === "medium"
                            ? "bg-yellow-500/15 text-yellow-300 border-yellow-400/40"
                            : "bg-rose-500/15 text-rose-300 border-rose-400/40"
                      )}
                    >
                      {riskLevel === "low" ? "Low Risk" : riskLevel === "medium" ? "Medium Risk" : "High Risk"}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-medium text-white/70">{invoice.buyer}</p>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Min APY</p>
                      <p className="mt-1 text-2xl font-bold text-blue-300">{invoice.yield.toFixed(2)}%</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Max Duration</p>
                      <p className="mt-1 text-2xl font-bold text-white">{durationDays} days</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em] text-white/45">
                      <span>Funding Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: invoice.status === "active" ? 1.04 : 1 }}
                    whileTap={{ scale: invoice.status === "active" ? 0.97 : 1 }}
                    disabled={invoice.status !== "active"}
                    onClick={() => void onFund(invoice.id)}
                    className={cn(
                      "mt-6 w-full rounded-full px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] transition-all",
                      invoice.status === "active"
                        ? "bg-white text-black button-glow hover:shadow-[0_0_24px_rgba(255,255,255,0.35)]"
                        : "border border-white/10 bg-white/5 text-white/40"
                    )}
                  >
                    {invoice.status === "active" ? "Fund Now" : invoice.status}
                  </motion.button>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </section>
      )}
    </div>
  );
}

function UploadView({ draft, setDraft, parsingInvoice, submittingInvoice, onFile, onSubmit, invoices, transactions, currentPerformer, onRegisterPerformer }: { draft: InvoiceDraft; setDraft: React.Dispatch<React.SetStateAction<InvoiceDraft>>; parsingInvoice: boolean; submittingInvoice: boolean; onFile: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>; onSubmit: () => Promise<void>; invoices: Invoice[]; transactions: Transaction[]; currentPerformer: Performer | null; onRegisterPerformer: (name: string, pfp?: string) => void }) {
  const latestEvents = transactions.slice(0, 4);
  const [displayName, setDisplayName] = useState("");
  const [profileImage, setProfileImage] = useState<string>("");
  const [previewBars] = useState([42, 58, 37, 66, 51, 73, 44]);

  return <div className="space-y-8 pb-10">
    <section className="grid gap-6 xl:grid-cols-[1fr_300px]">
      <div className="glass-panel rounded-[1.7rem] p-6 md:p-7 flex gap-5 items-center">
        <div className="h-16 w-16 rounded-full border border-white/10 bg-gradient-to-br from-blue-500/30 via-blue-500/10 to-transparent flex items-center justify-center">
          <Zap className="text-blue-300" size={24} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">Simulation Tier III</p>
          <h1 className="mt-1 font-headline text-4xl font-black text-white">Execution Command</h1>
          <p className="mt-1 text-sm text-white/50">Launch, monitor, and refine invoice financing simulations in real time.</p>
        </div>
      </div>
      <div className="glass-panel rounded-[1.4rem] p-5">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">Registered Profile</p>
        {currentPerformer ? <div className="mt-3 flex items-center gap-3">
          <img src={currentPerformer.pfp || "/fintrix-ai-logo.png"} alt={currentPerformer.name} className="h-12 w-12 rounded-full object-cover border border-white/10" />
          <div><p className="font-semibold text-white">{currentPerformer.name}</p><p className="text-xs text-white/45">Profile active for simulation actions</p></div>
        </div> : <p className="mt-2 text-sm text-white/55">Add your name and image to enable simulation creation.</p>}
      </div>
    </section>

    <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <div className="glass-panel rounded-[1.5rem] p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/40">Display Profile</p>
        <p className="mt-2 text-sm text-white/55">Set your name and optional profile image to continue.</p>
        <div className="mt-4 space-y-3">
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your display name" className="glass-input w-full rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-white/35" />
          <label className="block cursor-pointer rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-4 text-center text-sm text-white/70 hover:bg-white/10">
            {profileImage ? "Profile image selected" : "Upload profile image (optional)"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => setProfileImage(String(reader.result || ""));
              reader.readAsDataURL(file);
            }} />
          </label>
          <button onClick={() => { onRegisterPerformer(displayName, profileImage); setDisplayName(""); }} className="w-full rounded-xl bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-black">Save Profile</button>
        </div>
      </div>
      <div className="glass-panel rounded-[1.5rem] p-6">
        <h2 className="font-headline text-3xl font-black text-white">Simulation Usage</h2>
        <p className="mt-2 text-sm text-white/45">Track recent invoice execution behavior from real app actions.</p>
        <div className="mt-6 flex h-44 items-end gap-2">
          {previewBars.map((bar, i) => (
            <motion.div key={i} whileHover={{ scaleY: 1.08 }} className="flex-1 rounded-t-md bg-gradient-to-t from-blue-600/60 to-blue-300/80" style={{ height: `${bar}%` }} />
          ))}
        </div>
      </div>
    </section>

    <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="glass-panel rounded-[1.5rem] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline text-3xl font-black text-white">Execution History</h3>
            <p className="text-sm text-white/45">Real-time simulation audit trail</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => window.alert("Filter UI coming next: all assets currently displayed.")} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 hover:text-white">Filter by Asset</button>
            <button onClick={() => window.alert("CSV export triggered in MVP mode.")} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 hover:text-white">Export CSV</button>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {latestEvents.length ? latestEvents.map((tx, idx) => (
            <motion.div key={`${tx.name}-${idx}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center rounded-xl border border-white/5 bg-black/30 px-4 py-3 text-sm">
              <div>
                <p className="font-semibold text-white">{tx.name}</p>
                <p className="text-[11px] text-white/40 uppercase tracking-[0.12em]">{tx.type}</p>
              </div>
              <p className="font-semibold text-white/80">{tx.amount}</p>
              <p className={cn("font-semibold", tx.status === "Success" ? "text-emerald-300" : "text-blue-300")}>{tx.status}</p>
              <p className="text-white/50">{tx.time}</p>
            </motion.div>
          )) : <div className="rounded-xl border border-white/10 bg-white/[0.02] px-5 py-6 text-sm text-white/45">No simulation events yet. Create one below to start your execution history.</div>}
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass-panel rounded-[1.5rem] p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-400">Create Simulation</p>
          <h3 className="mt-2 font-headline text-3xl font-black text-white">Upload and list an invoice</h3>
          {!currentPerformer ? <div className="mt-4 rounded-xl border border-yellow-300/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">Complete Display Profile first to unlock simulation creation.</div> : null}
          <label className="mt-5 group relative flex min-h-[11rem] overflow-hidden cursor-pointer flex-col items-center justify-center rounded-[1.3rem] border-2 border-dashed border-white/20 bg-white/5 px-6 text-center transition-all hover:bg-white/10 hover:border-blue-400/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            <motion.div whileHover={{ y: -4 }} className="relative z-10 flex flex-col items-center">
              <div className="mb-4 rounded-full bg-blue-500/10 p-4 ring-1 ring-blue-500/20 group-hover:bg-blue-500/20 transition-colors"><Upload size={30} className="text-blue-400" /></div>
              <p className="font-bold text-white">Drop invoice here</p>
              <p className="mt-1 text-xs text-white/50">PDF or PNG for AI extraction</p>
            </motion.div>
            <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(event) => void onFile(event)} disabled={!currentPerformer} />
          </label>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="relative"><span className="absolute left-4 top-3.5 text-white/40 font-medium">$</span><input value={draft.amount} onChange={(event) => setDraft((current) => ({ ...current, amount: event.target.value }))} placeholder="Amount in USD" className="glass-input w-full rounded-xl pl-8 pr-4 py-3 text-white outline-none placeholder:text-white/30 font-medium" /></div>
            <input type="date" value={draft.dueDate} onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))} className="glass-input w-full rounded-xl px-4 py-3 text-white outline-none font-medium" />
            <input value={draft.buyer} onChange={(event) => setDraft((current) => ({ ...current, buyer: event.target.value }))} placeholder="Buyer name" className="glass-input w-full rounded-xl px-4 py-3 text-white outline-none placeholder:text-white/30 font-medium" />
            <input value={draft.number} onChange={(event) => setDraft((current) => ({ ...current, number: event.target.value }))} placeholder="Invoice number" className="glass-input w-full rounded-xl px-4 py-3 text-white outline-none placeholder:text-white/30 font-medium" />
          </div>
          <textarea rows={4} value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} placeholder="Optional notes from invoice review or AI summary" className="glass-input mt-4 w-full rounded-xl px-4 py-3 text-white outline-none placeholder:text-white/30 font-medium resize-none" />

          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => void onSubmit()} disabled={submittingInvoice || parsingInvoice || !currentPerformer} className={cn("mt-5 w-full rounded-full px-8 py-4 text-sm font-bold shadow-lg shadow-white/20 transition-all text-black", (submittingInvoice || parsingInvoice || !currentPerformer) ? "opacity-70 bg-white/80 cursor-not-allowed" : "bg-white hover:bg-blue-50 button-glow")}>{parsingInvoice ? "Parsing invoice with AI..." : submittingInvoice ? "Creating simulation..." : "Create Simulation"}</motion.button>
        </div>
      </div>
    </section>
  </div>;
}
function PortfolioView({ wallet, user, invoices }: { wallet: ConnectedWallet | null; user: UserState; invoices: Invoice[] }) {
  const ownedInvoices = invoices.filter((invoice) => invoice.funder === wallet?.publicKey || invoice.seller === formatAddress(wallet?.publicKey || ""));
  return <div className="space-y-8"><section><p className="text-[10px] uppercase tracking-[0.26em] text-white/30">Portfolio</p><h1 className="mt-3 font-headline text-5xl font-black tracking-tight md:text-6xl">Connected wallet summary</h1><p className="mt-4 max-w-2xl text-base leading-7 text-white/45">This view focuses on the wallet session and the invoices tied to it, rather than showing fictional enterprise profile data.</p></section><section className="grid gap-6 md:grid-cols-3"><div className="rounded-[1.8rem] border border-white/6 bg-[#1b1b1b] p-8"><p className="text-[10px] uppercase tracking-[0.24em] text-white/28">Wallet</p><p className="mt-4 break-all text-lg font-semibold text-white">{wallet ? wallet.publicKey : "No wallet connected"}</p></div><div className="rounded-[1.8rem] border border-white/6 bg-[#1b1b1b] p-8"><p className="text-[10px] uppercase tracking-[0.24em] text-white/28">XLM Balance</p><p className="mt-4 font-headline text-4xl font-black">{user.xlmBalance.toFixed(2)} XLM</p></div><div className="rounded-[1.8rem] border border-white/6 bg-[#1b1b1b] p-8"><p className="text-[10px] uppercase tracking-[0.24em] text-white/28">Related Invoices</p><p className="mt-4 font-headline text-4xl font-black">{ownedInvoices.length}</p></div></section><section className="grid gap-5 xl:grid-cols-2">{ownedInvoices.length ? ownedInvoices.map((invoice) => <div key={invoice.id} className="rounded-[1.8rem] border border-white/6 bg-[#151515] p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.22em] text-white/28">{invoice.id}</p><h3 className="mt-3 text-2xl font-bold">{invoice.buyer}</h3></div><span className="rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/70">{invoice.status}</span></div><p className="mt-5 text-sm leading-6 text-white/45">Amount ${invoice.amount.toLocaleString()} · Yield {invoice.yield}% · Due {formatDate(invoice.due)}</p></div>) : <div className="rounded-[1.8rem] border border-white/6 bg-[#151515] p-8 text-sm text-white/45">Connect a wallet and fund or list an invoice to populate the portfolio.</div>}</section></div>;
}

function ActivityView({ transactions, invoices, onRepay, performers }: { transactions: Transaction[]; invoices: Invoice[]; onRepay: (id: string) => Promise<void>; performers: Performer[] }) {
  const fundedInvoice = invoices.find((invoice) => invoice.status === "funded");
  return <div className="space-y-8"><section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-[10px] uppercase tracking-[0.26em] text-blue-400 font-bold">Activity Feed</p><h1 className="mt-3 font-headline text-5xl font-black tracking-tight md:text-6xl text-white">Simulation event history</h1><p className="mt-4 max-w-2xl text-base leading-7 text-white/50">Listing, funding, and repayment records are generated by the backend service and persisted to the local store for this MVP.</p></div>{fundedInvoice ? <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => void onRepay(fundedInvoice.id)} className="button-glow rounded-full bg-blue-500 font-bold text-white px-6 py-4 text-sm shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all hover:bg-blue-400">Trigger repayment for {fundedInvoice.id}</motion.button> : null}</section><div className="space-y-4">{transactions.map((transaction, index) => <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} key={`${transaction.name}-${index}`} className="glass-panel group rounded-[1.6rem] px-6 py-5 transition-transform hover:-translate-y-1 hover:border-blue-500/30"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p className="font-semibold text-white group-hover:text-blue-200 transition-colors">{transaction.name}</p><p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40"><span className={cn("rounded px-2 py-0.5", transaction.type === "Fund" ? "bg-blue-500/20 text-blue-300" : transaction.type === "Repay" ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/70")}>{transaction.type}</span> <span className="ml-2 font-normal text-white/30">· {transaction.status}</span></p></div><div className="flex items-center gap-6 text-sm text-white/60"><span className="font-mono text-white/80">{transaction.amount}</span><span className="font-mono text-blue-300">{transaction.xlm}</span><span className="inline-flex items-center gap-2 text-white/40"><Clock3 size={14} />{transaction.time}</span></div></div></motion.div>)}</div><section className="glass-panel rounded-[2rem] p-8 border-t border-t-white/10"><div className="mb-8 flex items-center justify-between"><h2 className="font-headline text-4xl font-black text-white">Leaderboard</h2><span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.26em] text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)] flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />Weekly</span></div><div className="space-y-3">{performers.length ? performers.slice(0, 5).map((entry, idx) => <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={entry.id} className="flex items-center justify-between rounded-xl border border-white/5 px-6 py-4 backdrop-blur-md transition-all hover:scale-[1.01] hover:shadow-lg"><div className="flex items-center gap-3"><span className="font-headline text-2xl font-black w-8 text-center text-white/40">{String(idx + 1).padStart(2, "0")}</span><img src={entry.pfp || "/fintrix-ai-logo.png"} alt={entry.name} className="h-8 w-8 rounded-full object-cover border border-white/10" /><div><p className="font-bold text-white text-base">{entry.name}</p><p className="text-xs font-medium text-white/50 mt-0.5">Wins: {entry.wins}</p></div></div><div className="text-right text-lg font-bold text-blue-400">{entry.roi.toFixed(1)}%</div></motion.div>) : <div className="rounded-xl border border-white/10 px-5 py-4 text-sm text-white/55">No registered performers yet.</div>}</div></section></div>;
}

function ensureMvpVisitorId() {
  const key = "fintrix_mvp_visitor_id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const created = `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(key, created);
  return created;
}

function WalletGate({ onWallet }: { onWallet: () => void }) {
  return <div className="glass-panel mx-auto mt-10 max-w-2xl rounded-3xl border border-white/10 p-10 text-center">
    <h2 className="font-headline text-4xl font-black text-white">Wallet connection required</h2>
    <p className="mt-3 text-white/55">Connect your wallet to access Dashboard, Marketplace, Simulation, Portfolio, and Resources.</p>
    <button onClick={onWallet} className="mt-6 rounded-full bg-white px-8 py-3 text-sm font-bold text-black">Connect Wallet to Continue</button>
  </div>;
}

function playNotificationTone() {
  const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  const context = new Ctx();
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = "sine";
  osc.frequency.value = 720;
  gain.gain.value = 0.00001;
  osc.connect(gain);
  gain.connect(context.destination);
  const t = context.currentTime;
  gain.gain.exponentialRampToValueAtTime(0.03, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.00001, t + 0.17);
  osc.start(t);
  osc.stop(t + 0.2);
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AppView>("landing");
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [networkSummary, setNetworkSummary] = useState({ network: "Stellar Testnet", sorobanRpcUrl: "Configured externally" });
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletBusy, setWalletBusy] = useState<WalletOption | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [draft, setDraft] = useState<InvoiceDraft>(defaultDraft);
  const [toast, setToast] = useState<string | null>(null);
  const [assistantNotice, setAssistantNotice] = useState<string | null>(null);
  const [submittingInvoice, setSubmittingInvoice] = useState(false);
  const [parsingInvoice, setParsingInvoice] = useState(false);
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [user, setUser] = useState<UserState>({ wallet: null, role: "investor", totalInvested: 0, totalReturns: 0, roi: 0, dealsCompleted: 0, xlmBalance: 0 });

  useEffect(() => {
    void Promise.all([getInvoices(), getTransactions(), getNetworkSummary()])
      .then(([nextInvoices, nextTransactions, nextNetwork]) => {
        setInvoices(nextInvoices);
        setTransactions(nextTransactions);
        setNetworkSummary(nextNetwork);
      })
      .catch(() => {
        setToast("Unable to load marketplace data.");
      });
  }, []);
  useEffect(() => {
    const visitorId = ensureMvpVisitorId();
    void fetch("/api/track-visitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: visitorId,
        userAgent: window.navigator.userAgent,
        language: window.navigator.language,
        platform: window.navigator.platform,
      }),
    }).catch(() => {
      // silent: tracking should not block UX
    });
  }, []);
  useEffect(() => { if (!toast) return; const timeout = window.setTimeout(() => setToast(null), 3500); return () => window.clearTimeout(timeout); }, [toast]);
  useEffect(() => {
    const key = "fintrix_performers";
    const parsed = window.localStorage.getItem(key);
    if (parsed) {
      try { setPerformers(JSON.parse(parsed) as Performer[]); } catch { /* ignore */ }
    }
  }, []);
  useEffect(() => {
    window.localStorage.setItem("fintrix_performers", JSON.stringify(performers));
  }, [performers]);
  useEffect(() => { if (assistantNotice) playNotificationTone(); }, [assistantNotice]);

  const metrics = useMemo(() => {
    const safeInvoices = Array.isArray(invoices) ? invoices : [];
    const capital = safeInvoices.filter((invoice) => invoice.status !== "repaid").reduce((sum, invoice) => sum + invoice.amount, 0);
    return [{ label: "Listed invoices", value: safeInvoices.length, hint: "Loaded from the backend store" }, { label: "Capital in play", value: `$${capital.toLocaleString()}`, hint: "Marketplace principal value" }, { label: "Funded deals", value: safeInvoices.filter((invoice) => invoice.status === "funded").length, hint: "Awaiting repayment" }, { label: "Activity events", value: transactions.length, hint: "List, fund, and repay actions" }];
  }, [invoices, transactions]);

  async function refreshTransactions() { setTransactions(await getTransactions()); }

  async function connect(provider: WalletOption, publicKey?: string) {
    try {
      setWalletBusy(provider);
      const nextWallet = provider === "freighter" ? await connectFreighterWallet() : await connectManualWallet("albedo", publicKey);
      const xlmBalance = await getAccountBalance(nextWallet.publicKey);
      setWallet(nextWallet);
      setUser((current) => ({ ...current, wallet: nextWallet, xlmBalance, totalInvested: invoices.filter((invoice) => invoice.funder === nextWallet.publicKey).reduce((sum, invoice) => sum + invoice.amount, 0), totalReturns: transactions.filter((transaction) => transaction.type === "Repay").length, roi: 0, dealsCompleted: transactions.length }));
      setWalletModalOpen(false);
      setView("dashboard");
      setToast(`${nextWallet.label} connected: ${formatAddress(nextWallet.publicKey)}`);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Wallet connection failed.");
    } finally {
      setWalletBusy(null);
    }
  }

  async function fund(id: string) {
    if (!wallet) return setWalletModalOpen(true);
    try {
      if (!window.confirm("Would you like to review AI risk detection before funding this transaction?")) {
        setAssistantNotice("Risk Detector: Review invoice risk score, expected yield, and duration before funding.");
        return;
      }
      if (wallet.provider === "freighter") await confirmFreighterAction();
      const invoice = invoices.find((item) => item.id === id);
      if (!invoice) throw new Error("Invoice not found.");
      const preview = await buildSorobanEscrowPreview(invoice.id, invoice.amount);
      const updated = await fundInvoiceOnBackend(id, wallet.publicKey, wallet.provider);
      setInvoices((current) => current.map((item) => (item.id === id ? updated : item)));
      await refreshTransactions();
      setToast(`Funding submitted via ${preview.settlementAsset} preview for ${invoice.id}.`);
      setAssistantNotice(`Transaction successful: funding submitted for ${invoice.id}.`);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Funding failed.");
    }
  }

  async function repay(id: string) {
    if (!wallet) return setWalletModalOpen(true);
    try {
      if (!window.confirm("Would you like AI risk detection before triggering repayment?")) {
        setAssistantNotice("Risk Detector: Confirm invoice status is funded and settlement amount is expected before repayment.");
        return;
      }
      if (wallet.provider === "freighter") await confirmFreighterAction();
      const updated = await repayInvoiceOnBackend(id);
      setInvoices((current) => current.map((item) => (item.id === id ? updated : item)));
      await refreshTransactions();
      setToast(`Invoice ${id} repaid.`);
      setAssistantNotice(`Transaction successful: ${id} repaid.`);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Repayment failed.");
    }
  }

  async function fileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setParsingInvoice(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result || "")); reader.onerror = () => reject(new Error("Unable to read file.")); reader.readAsDataURL(file); });
      const parsed = await parseInvoiceWithAI(base64, file.type);
      setDraft((current) => ({ ...current, amount: String(parsed.amount), dueDate: parsed.dueDate, buyer: parsed.buyerName, number: parsed.invoiceNumber, notes: parsed.summary || current.notes }));
      setToast("Invoice fields extracted and ready for review.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Invoice parsing failed.");
    } finally {
      setParsingInvoice(false);
      event.target.value = "";
    }
  }

  async function submit() {
    if (!wallet) return setWalletModalOpen(true);
    const amountNum = Number(draft.amount.replace(/,/g, ""));
    if (!draft.amount || isNaN(amountNum) || amountNum <= 0) return setToast("Please enter a valid invoice amount greater than $0.");
    if (!draft.buyer.trim()) return setToast("Buyer / counterparty name is required.");
    if (!draft.dueDate) return setToast("Please select a due date for the invoice.");
    const dueTimestamp = new Date(draft.dueDate).getTime();
    if (isNaN(dueTimestamp) || dueTimestamp < Date.now()) return setToast("Due date must be a valid future date.");
    try {
      if (!window.confirm("Would you like AI risk detection before creating this simulation?")) {
        setAssistantNotice("Risk Detector: Verify buyer identity, amount, due date, and notes before creating the simulation.");
        return;
      }
      if (wallet.provider === "freighter") await confirmFreighterAction();
      setSubmittingInvoice(true);
      const created = await createInvoice({ amount: Number(draft.amount.replace(/,/g, "")), due: draft.dueDate, buyer: draft.buyer, number: draft.number, discount: draft.discount, seller: formatAddress(wallet.publicKey), notes: draft.notes });
      setInvoices((current) => [created, ...current]);
      await refreshTransactions();
      setDraft(defaultDraft);
      setView("marketplace");
      setToast(`Simulation ${created.id} created.`);
      setAssistantNotice(`Transaction successful: simulation ${created.id} created.`);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not create invoice.");
    } finally {
      setSubmittingInvoice(false);
    }
  }

  function registerPerformer(name: string, pfp?: string) {
    if (!wallet) {
      setWalletModalOpen(true);
      return;
    }
    const trimmed = name.trim();
    if (!trimmed) {
      setToast("Enter a performer name to register.");
      return;
    }
    setPerformers((current) => {
      if (current.some((item) => item.name.toLowerCase() === trimmed.toLowerCase())) return current;
      const next: Performer = {
        id: `${trimmed}-${Date.now()}`,
        wallet: wallet.publicKey,
        name: trimmed,
        pfp: (pfp || "").trim(),
        roi: Number((6 + Math.random() * 12).toFixed(1)),
        sharpe: Number((1.8 + Math.random() * 2.2).toFixed(2)),
        wins: Math.floor(1 + Math.random() * 12),
      };
      return [next, ...current].sort((a, b) => b.roi - a.roi);
    });
    setToast(`${trimmed} registered on weekly leaderboard.`);
  }

  const currentPerformer = useMemo(() => (wallet ? performers.find((item) => item.wallet === wallet.publicKey) || null : null), [performers, wallet]);

  const walletModal = <WalletModal open={walletModalOpen} busy={walletBusy} onConnect={connect} onClose={() => setWalletModalOpen(false)} />;
  const toasts = <AnimatePresence>{toast ? <Toast message={toast} /> : null}</AnimatePresence>;

  if (view === "landing") return <ErrorBoundary><AnimatePresence>{loading && <LoadingScreen onComplete={() => setLoading(false)} />}</AnimatePresence><div style={{ visibility: loading ? "hidden" : "visible" }}>{toasts}{walletModal}<Web3HeroLanding onLaunch={() => setView("upload")} /></div></ErrorBoundary>;

  if (!wallet) {
    return <ErrorBoundary><>{toasts}{walletModal}<AppShell view={view} setView={setView} wallet={wallet} network={networkSummary.network} onWallet={() => setWalletModalOpen(true)}><WalletGate onWallet={() => setWalletModalOpen(true)} /></AppShell><FintrixAssistant view={view} walletAddress={wallet?.publicKey} notification={assistantNotice} /></></ErrorBoundary>;
  }

  return <ErrorBoundary><>{toasts}{walletModal}<AppShell view={view} setView={setView} wallet={wallet} network={networkSummary.network} onWallet={() => setWalletModalOpen(true)}>{view === "dashboard" ? <DashboardView wallet={wallet} user={user} invoices={invoices} onNavigate={setView} /> : null}{view === "marketplace" ? <MarketplaceView invoices={invoices} onFund={fund} /> : null}{view === "upload" ? <UploadView draft={draft} setDraft={setDraft} parsingInvoice={parsingInvoice} submittingInvoice={submittingInvoice} onFile={fileUpload} onSubmit={submit} invoices={invoices} transactions={transactions} currentPerformer={currentPerformer} onRegisterPerformer={registerPerformer} /> : null}{view === "portfolio" ? <PortfolioView wallet={wallet} user={user} invoices={invoices} /> : null}{view === "activity" ? <ActivityView transactions={transactions} invoices={invoices} onRepay={repay} performers={performers} /> : null}</AppShell><FintrixAssistant view={view} walletAddress={wallet?.publicKey} notification={assistantNotice} /></></ErrorBoundary>;
}

















