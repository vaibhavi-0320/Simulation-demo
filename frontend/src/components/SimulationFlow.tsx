import React, { useMemo, useState } from "react";
import { Calculator, TrendingUp } from "lucide-react";
import type { Invoice } from "../types";
import { simulateOnTestnet } from "../services/stellarService";
import { useViewport } from "../hooks/useViewport";
import { InvoiceUploader } from "./InvoiceUploader";

interface SimulationFlowProps {
  invoices: Invoice[];
  sidebarOpen: boolean;
  walletAddress?: string | null;
}

const XLM_USD = 0.11;
const JOURNEY_STEPS = [
  { id: 1, label: "Upload Invoice", panel: { tag: "01 / SUBMISSION", title: "Upload Invoice", description: "SMEs upload unpaid invoices to the Fintrix platform for AI-powered evaluation.", chips: ["PDF/Image supported", "Auto OCR extraction", "Instant submission"] }, status: { title: "Document Ready", checks: ["File format validated", "OCR complete", "Data extracted"] } },
  { id: 2, label: "AI Verification", panel: { tag: "02 / ANALYSIS", title: "AI Verification", description: "Our AI engine scores the invoice against 40+ risk parameters and assigns a Trust Score.", chips: ["Risk scoring", "Fraud detection", "Credibility check"] }, status: { title: "Verification in Progress", checks: ["Invoice structure parsed", "Risk checks completed", "Marketplace ready"] } },
  { id: 3, label: "Marketplace", panel: { tag: "03 / LISTING", title: "Marketplace", description: "Verified invoices are listed on the marketplace for investors to browse and fund.", chips: ["Live APY display", "Trust Score visible", "Funding progress"] }, status: { title: "Listed & Active", checks: ["Deal published", "Investor visibility on", "Funding window open"] } },
  { id: 4, label: "Funding", panel: { tag: "04 / SETTLEMENT", title: "Funding", description: "Wallet-connected investors fund the invoice, triggering the on-chain Stellar payment.", chips: ["Wallet-based execution", "Soroban-backed workflow", "Clear settlement status"] }, status: { title: "On-Chain Confirmed", checks: ["Freighter signed", "Horizon submitted", "Hash confirmed"] } },
];

function daysUntil(date: string) {
  const ms = new Date(date).getTime() - Date.now();
  return Math.max(1, Math.ceil(ms / 86_400_000));
}

function FinancingJourney({ isMobile }: { isMobile: boolean }) {
  const [activeStep, setActiveStep] = useState(1);
  const step = JOURNEY_STEPS.find((item) => item.id === activeStep)!;

  return (
    <div style={{ marginBottom: "48px" }}>
      <p style={{ textAlign: "center", color: "#6b7280", letterSpacing: "0.15em", fontSize: "0.75rem", marginBottom: "8px", textTransform: "uppercase" }}>THE FINANCING JOURNEY</p>
      <h2 style={{ textAlign: "center", fontSize: "1.8rem", fontWeight: 700, color: "#fff", marginBottom: "32px" }}>An interactive path from invoice upload to funding.</h2>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        {JOURNEY_STEPS.map((item) => (
          <button key={item.id} onClick={() => setActiveStep(item.id)} style={{ flex: 1, minWidth: isMobile ? "100%" : "140px", padding: "14px 20px", borderRadius: "999px", border: "1px solid", borderColor: activeStep === item.id ? "transparent" : "#374151", background: activeStep === item.id ? "linear-gradient(135deg, #1e3a5f, #1e40af)" : "transparent", color: "#fff", fontWeight: activeStep === item.id ? 600 : 400, cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", transition: "all 0.2s ease" }}>
            <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: activeStep === item.id ? "#3b82f6" : "#374151", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>{item.id}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
        <div style={{ background: "#0f172a", borderRadius: "12px", padding: "28px", border: "1px solid #1e293b" }}>
          <p style={{ color: "#6b7280", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px" }}>{step.panel.tag}</p>
          <h3 style={{ color: "#fff", fontSize: "1.4rem", fontWeight: 700, marginBottom: "12px" }}>{step.panel.title}</h3>
          <p style={{ color: "#9ca3af", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "20px" }}>{step.panel.description}</p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {step.panel.chips.map((chip) => <span key={chip} style={{ padding: "6px 14px", border: "1px solid #374151", borderRadius: "999px", color: "#d1d5db", fontSize: "0.75rem" }}>{chip}</span>)}
          </div>
          {activeStep === 1 && (
            <InvoiceUploader
              onParsed={(data) => {
                console.log("[JOURNEY] Invoice parsed:", data);
                window.setTimeout(() => setActiveStep(2), 1000);
              }}
            />
          )}
        </div>

        <div style={{ background: "#0f172a", borderRadius: "12px", padding: "28px", border: "1px solid #1e293b" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <p style={{ color: "#6b7280", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>SIMULATION MODE: ACTIVE</p>
            <p style={{ color: "#6b7280", fontSize: "0.7rem" }}>STEP {activeStep}</p>
          </div>
          <div style={{ background: "#1e293b", borderRadius: "8px", padding: "20px" }}>
            <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>{["#ef4444", "#f59e0b", "#22c55e"].map((color) => <div key={color} style={{ width: "10px", height: "10px", borderRadius: "50%", background: color }} />)}</div>
            <p style={{ color: "#9ca3af", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>SYSTEM STATUS</p>
            <h4 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 600, marginBottom: "16px" }}>{step.status.title}</h4>
            <div style={{ height: "4px", background: "#334155", borderRadius: "2px", marginBottom: "16px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(activeStep / 4) * 100}%`, background: "linear-gradient(90deg, #06b6d4, #3b82f6)", borderRadius: "2px", transition: "width 0.4s ease" }} />
            </div>
            {step.status.checks.map((check) => <div key={check} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}><span style={{ color: "#22c55e", fontSize: "0.85rem" }}>⊙</span><span style={{ color: "#d1d5db", fontSize: "0.85rem" }}>{check}</span></div>)}
          </div>
          {activeStep === 4 && <button onClick={() => document.getElementById("simulator-section")?.scrollIntoView({ behavior: "smooth", block: "start" })} style={{ marginTop: "16px", padding: "12px 24px", background: "#fff", color: "#000", borderRadius: "999px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}>Try Simulation →</button>}
        </div>
      </div>
    </div>
  );
}

export default function SimulationFlow({ invoices, sidebarOpen, walletAddress }: SimulationFlowProps) {
  const { isMobile, isTablet } = useViewport();
  const deals = useMemo(() => invoices.filter((invoice) => invoice.status === "active").map((invoice) => ({ id: invoice.id, company: invoice.companyName || invoice.buyer, apy: invoice.yield || invoice.discount || 0, durationDays: daysUntil(invoice.due), repaymentDate: invoice.due, amount: invoice.amount })), [invoices]);
  const [amount, setAmount] = useState<number>(1000);
  const [selectedDeal, setSelectedDeal] = useState<any>(deals[0] || null);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);
  const [simResult, setSimResult] = useState<any>(null);

  const apy = selectedDeal?.apy || 0;
  const durationDays = selectedDeal?.durationDays || selectedDeal?.duration || 180;
  const estimatedReturn = parseFloat((amount * (apy / 100) * (durationDays / 365)).toFixed(2));
  const totalReceived = amount + estimatedReturn;
  const xlmEquivalent = (totalReceived / XLM_USD).toFixed(2);
  const returnProgress = Math.min(100, Math.max(4, apy * 7));
  const sideW = isMobile ? "0" : sidebarOpen ? "16rem" : "4.5rem";

  React.useEffect(() => {
    if (!selectedDeal && deals[0]) setSelectedDeal(deals[0]);
    if (selectedDeal && !deals.some((deal) => deal.id === selectedDeal.id)) setSelectedDeal(deals[0] || null);
  }, [deals, selectedDeal]);

  async function handleSimulate() {
    if (!selectedDeal) return;
    setSimLoading(true);
    setSimError(null);
    setSimResult(null);
    try {
      const result = await simulateOnTestnet(amount, { id: selectedDeal.id, company: selectedDeal.company, apy: selectedDeal.apy, durationDays, repaymentDate: selectedDeal.repaymentDate });
      setSimResult(result);
      
      // Fix 4: Increment simulations run counter on successful simulation
      const current = parseInt(localStorage.getItem('simulationsRun') || '0', 10);
      localStorage.setItem('simulationsRun', String(current + 1));
      
    } catch (error: any) {
      setSimError(error.message || "Simulation failed");
    } finally {
      setSimLoading(false);
    }
  }

  const panelStyle: React.CSSProperties = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem" };
  const inputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", background: "#000", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "0.5rem", color: "#fff", outline: "none", padding: "1rem", fontFamily: "Inter, sans-serif", fontSize: "1rem" };

  return (
    <div style={{ marginLeft: sideW, minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "Inter, sans-serif", transition: "margin-left 0.28s cubic-bezier(.4,0,.2,1)" }}>
      <header style={{ position: "fixed", top: 0, right: 0, left: sideW, zIndex: 40, height: "4rem", display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "0 1rem 0 4rem" : "0 2rem", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.78)", backdropFilter: "blur(12px)", transition: "left 0.28s cubic-bezier(.4,0,.2,1)" }}>
        <div>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.16em" }}>Investment Simulator</p>
          <h1 style={{ fontSize: isMobile ? "1rem" : "1.25rem", fontWeight: 700 }}>Model invoice returns before funding</h1>
        </div>
        {!isMobile && walletAddress ? <span style={{ fontSize: "12px", fontFamily: "monospace", color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)" }}>{walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}</span> : null}
      </header>

      <main style={{ padding: isMobile ? "5.25rem 1rem 5.5rem" : "7rem 2.5rem 3rem", maxWidth: "1180px", margin: "0 auto" }}>
        <div id="simulation-page">
          <FinancingJourney isMobile={isMobile} />
          <div id="simulator-section">
            <div style={{ display: "grid", gridTemplateColumns: isTablet ? "1fr" : "minmax(0, 0.9fr) minmax(340px, 0.65fr)", gap: "2rem", alignItems: "start" }}>
              <section style={{ ...panelStyle, padding: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,102,255,0.12)", color: "#0066FF" }}><Calculator size={22} /></div>
                  <div><h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Return Inputs</h2><p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.875rem" }}>Uses real deal data from the marketplace.</p></div>
                </div>

                <div style={{ display: "grid", gap: "1.25rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: "0.5rem" }}>Investment Amount (USD)</label>
                    <input type="number" min="1" value={amount} onChange={(event) => setAmount(Math.max(0, Number(event.target.value) || 0))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: "0.5rem" }}>Invoice / Deal</label>
                    <select value={selectedDeal?.id || ""} onChange={(event) => setSelectedDeal(deals.find((deal) => deal.id === event.target.value) || null)} style={{ ...inputStyle, cursor: "pointer" }}>
                      {deals.map((deal) => <option key={deal.id} value={deal.id} style={{ background: "#000" }}>{deal.company} - {deal.apy}% APY - ${deal.amount.toLocaleString()}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "1rem" }}>
                    {[{ label: "Duration", value: `${durationDays} days` }, { label: "APY", value: `${apy.toFixed(1)}%` }, { label: "XLM Rate", value: "$0.11" }].map((item) => <div key={item.label} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", padding: "1rem", background: "rgba(255,255,255,0.03)" }}><p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.38)", marginBottom: "0.35rem" }}>{item.label}</p><p style={{ fontSize: "1.25rem", fontWeight: 700 }}>{item.value}</p></div>)}
                  </div>
                  <div>
                    <button onClick={() => void handleSimulate()} disabled={simLoading || !selectedDeal} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: "#fff", color: "#000", border: "none", borderRadius: "0.5rem", padding: "1rem 1.5rem", fontWeight: 800, cursor: simLoading || !selectedDeal ? "not-allowed" : "pointer", opacity: simLoading || !selectedDeal ? 0.7 : 1, fontFamily: "Inter, sans-serif", width: "100%" }}>{simLoading ? "Waiting for Freighter..." : "Simulate on Testnet ▷"}</button>
                    {simError && <p style={{ color: "#f87171", fontSize: "0.8rem", marginTop: "8px" }}>{simError}</p>}
                  </div>
                </div>
              </section>

              <section style={{ ...panelStyle, padding: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,102,255,0.12)", color: "#0066FF" }}><TrendingUp size={22} /></div>
                  <div><h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Projected Outcome</h2><p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.875rem" }}>{selectedDeal ? selectedDeal.company : "No deal selected"}</p></div>
                </div>
                <div style={{ display: "grid", gap: "1rem" }}>
                  {[{ label: "Estimated Return", value: `$${estimatedReturn.toFixed(2)}`, color: "#0066FF" }, { label: "Total Received", value: `$${totalReceived.toFixed(2)}` }, { label: "XLM Equivalent", value: `${Number(xlmEquivalent).toLocaleString(undefined, { maximumFractionDigits: 2 })} XLM` }].map((item) => <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.85rem", gap: "1rem" }}><span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem" }}>{item.label}</span><span style={{ fontSize: isMobile ? "1rem" : "1.25rem", fontWeight: 800, color: item.color || "#fff", fontFamily: "monospace", textAlign: "right" }}>{item.value}</span></div>)}
                </div>
                <div style={{ marginTop: "2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "12px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.08em" }}><span>Return Intensity</span><span>{apy.toFixed(1)}%</span></div>
                  <div style={{ height: "10px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}><div style={{ height: "100%", width: `${returnProgress}%`, borderRadius: "999px", background: "#0066FF", transition: "width 0.6s ease" }} /></div>
                </div>
                {simResult && <div className="sim-result-card" style={{ marginTop: "2rem", border: "1px solid rgba(0,102,255,0.35)", background: "rgba(0,102,255,0.08)", borderRadius: "0.75rem", padding: "1.25rem" }}><p style={{ color: "#4ade80", fontWeight: 600 }}>✓ Simulation recorded on-chain</p><div style={{ marginTop: "8px", fontSize: "0.8rem", color: "#9ca3af", lineHeight: 1.8 }}><div>SimID: <span style={{ color: "#fff" }}>{simResult.simId}</span></div><div>Amount: <span style={{ color: "#fff" }}>${simResult.amountUSD.toLocaleString()}</span></div><div>Expected Return: <span style={{ color: "#60a5fa" }}>${simResult.expectedReturn}</span></div><div>Maturity: <span style={{ color: "#fff" }}>{simResult.maturityDate}</span></div><div>Tx Hash: <span style={{ color: "#fff", wordBreak: "break-all" }}>{simResult.txHash}</span></div><div style={{ marginTop: "6px" }}><a href={simResult.explorerUrl} target="_blank" rel="noreferrer" style={{ color: "#818cf8", fontSize: "0.72rem" }}>View on Stellar Explorer →</a></div></div></div>}
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
