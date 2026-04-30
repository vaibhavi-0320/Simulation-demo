import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, ClipboardList, Banknote, CalendarCheck, Lock, Info } from "lucide-react";
import { getAccountBalance } from "../services/stellarService";
import { checkFreighter, fundInvoiceOnChain } from "../services/stellarTransactions";
import { useViewport } from "../hooks/useViewport";
import { SkeletonDeals } from "./PageSkeletons";
import { usePageSkeleton } from "../hooks/usePageSkeleton";

const API_BASE = import.meta.env.VITE_API_URL || '';

interface DealDetailViewProps {
  invoice: {
    id: string;
    buyer: string;
    amount: number;
    due: string;
    status: string;
    yield: number;
    riskScore: number;
  } | null;
  wallet: string | null;
  onFund: (id: string, amount: number) => Promise<{ txHash?: string } | void>;
  onBack: () => void;
  sidebarOpen: boolean;
}

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.1)",
};

export default function DealDetailView({ invoice, wallet, onBack, sidebarOpen }: DealDetailViewProps) {
  const { isMobile, isTablet } = useViewport();
  const loading = usePageSkeleton("deal-detail");
  const [investAmount, setInvestAmount] = useState("");
  const [fundLoading, setFundLoading] = useState(false);
  const [fundError, setFundError] = useState<string | null>(null);
  const [fundSuccess, setFundSuccess] = useState<{ txHash: string; explorerUrl: string } | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  useEffect(() => {
    if (wallet) {
      getAccountBalance(wallet).then(setWalletBalance).catch(() => setWalletBalance(0));
    }
  }, [wallet]);

  const sideW = isMobile ? "0" : sidebarOpen ? "16rem" : "4.5rem";
  const inv = invoice ?? { id: "INV-4921", buyer: "ABC Export Pvt Ltd", amount: 5000, due: "2026-06-15", status: "active", yield: 8.2, riskScore: 20, industry: "Export & Trade Finance", country: "India" };
  const maxDue = new Date();
  maxDue.setFullYear(maxDue.getFullYear() + 5);
  const dueDate = new Date(inv.due);
  const dateInvalid = dueDate.getTime() > maxDue.getTime();
  const pct = inv.status === "funded" || inv.status === "repaid" ? 100 : 40;
  const fundedAmount = Math.floor((inv.amount * pct) / 100);
  const numInvest = parseFloat(investAmount) || 0;
  const estReturn = numInvest > 0 ? (numInvest * (1 + inv.yield / 100)).toFixed(2) : "—";
  const estProfit = numInvest > 0 ? ((numInvest * inv.yield) / 100).toFixed(2) : "—";
  const riskLevel = inv.riskScore < 40 ? "LOW" : inv.riskScore < 65 ? "MEDIUM" : "HIGH";
  const rawDurDays = Math.max(1, Math.ceil((new Date(inv.due).getTime() - Date.now()) / (1000 * 86400)));
  const durDays = dateInvalid ? 0 : rawDurDays;
  const listDate = new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0];

  async function handleFund() {
    if (!wallet) {
      setFundError('Please connect your Freighter wallet first');
      return;
    }

    if (!investAmount || Number(investAmount) < 100) {
      setFundError('Minimum investment is $100');
      return;
    }

    setFundLoading(true);
    setFundError(null);
    setFundSuccess(null);

    try {
      // Step 1: Verify Freighter is connected
      const publicKey = await checkFreighter();

      // Step 2: Convert USD amount to XLM (rough conversion for testnet)
      const xlmAmount = (Number(investAmount) / 0.11).toFixed(7);

      // Step 3: Build + sign + submit — Freighter popup opens HERE
      const result = await fundInvoiceOnChain({
        funderPublicKey: publicKey,
        amountXLM: xlmAmount,
        invoiceId: inv.id,
      });

      // Step 4: AFTER blockchain success, tell backend to record it (simple POST, no Stellar)
      try {
        await fetch(`${API_BASE}/api/invoices/${inv.id}/fund`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Number(investAmount),
            txHash: result.txHash,
            funderWallet: publicKey,
          }),
        });
      } catch {
        // Backend update is optional — blockchain tx is the source of truth
      }

      // Step 5: Update UI with success
      setFundSuccess({
        txHash: result.txHash,
        explorerUrl: result.explorerUrl,
      });
      setWalletBalance(await getAccountBalance(wallet));

    } catch (error: any) {
      console.error('Transaction failed:', error);
      setFundError(error.message || 'Transaction failed. Please try again.');
    } finally {
      setFundLoading(false);
    }
  }

  const timeline = [
    { label: "Listed", date: listDate, icon: <ClipboardList size={16} />, active: true, color: "#fff" },
    { label: "Funding", date: "In Progress", icon: <Banknote size={16} />, active: pct > 0, color: "#0266ff" },
    { label: "Repayment", date: inv.due, icon: <CalendarCheck size={16} />, active: false, color: "rgba(255,255,255,0.2)" },
  ];

  if (loading) return <SkeletonDeals sidebarOpen={sidebarOpen} />;

  return (
    <div className="page-fade-in" style={{ marginLeft: sideW, minHeight: "100vh", background: "#000", color: "#e2e2e2", fontFamily: "Inter, sans-serif", transition: "margin-left 0.28s cubic-bezier(.4,0,.2,1)" }}>
      <header style={{ position: "fixed", top: 0, right: 0, left: sideW, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "0 1rem 0 4rem" : "0 2.5rem", height: "5rem", zIndex: 40, transition: "left 0.28s cubic-bezier(.4,0,.2,1)" }}>
        <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: "0.5rem" }}>
          <button onClick={onBack} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.875rem", fontFamily: "Inter, sans-serif" }}>
            <span style={{ display: "flex" }}><ArrowLeft size={20} /></span> Back
          </button>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>{inv.buyer}</h1>
        </div>
      </header>

      <main style={{ paddingTop: "5rem", minHeight: "100vh" }}>
        <div style={{ padding: isMobile ? "1rem 1rem 5.5rem" : "2rem 2.5rem", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: isTablet ? "column" : "row", gap: "2rem" }}>
          <div style={{ flex: "1 1 0", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <section style={{ ...glassCard, borderRadius: "0.75rem", padding: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
                {[
                  { label: "Invoice Amount", value: `$${inv.amount.toLocaleString()}.00` },
                  { label: "APY", value: `${inv.yield}%`, color: "#0066FF" },
                  { label: "Duration", value: dateInvalid ? "Invalid" : `${durDays} Days` },
                  { label: "Repayment Date", value: dateInvalid ? "Invalid date" : inv.due },
                ].map((item) => (
                  <div key={item.label}>
                    <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>{item.label}</p>
                    <p style={{ fontSize: "1.5rem", fontWeight: 600, color: item.color ?? "#fff", fontFamily: "monospace", letterSpacing: "-0.02em" }}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>Funding Progress</span>
                  <span style={{ color: "#fff" }}>{pct}.0% — <span style={{ color: "rgba(255,255,255,0.4)" }}>${fundedAmount.toLocaleString()} / ${inv.amount.toLocaleString()}</span></span>
                </div>
                <div style={{ height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "9999px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "#fff", transition: "width 0.8s ease", borderRadius: "9999px" }} />
                </div>
              </div>
            </section>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1.5rem" }}>
              <section style={{ ...glassCard, borderRadius: "0.75rem", padding: "1.5rem" }}>
                <h3 style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "1rem" }}>Buyer Details</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {[
                    { label: "Company", value: (inv as any).companyName || inv.buyer },
                    { label: "Industry", value: (inv as any).industry || "—" },
                    { label: "Country", value: (inv as any).country || "—" },
                  ].map((row) => (
                    <div key={row.label}>
                      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase", marginBottom: "2px" }}>{row.label}</p>
                      <p style={{ color: "#fff", fontWeight: 500 }}>{row.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section style={{ ...glassCard, borderRadius: "0.75rem", padding: "1.5rem" }}>
                <h3 style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "1rem" }}>Risk & Structure</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase" }}>Risk Level</span>
                  <span style={{ background: "rgba(2,102,255,0.2)", color: "#0266ff", padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700 }}>{riskLevel}</span>
                </div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", padding: 0, margin: 0 }}>
                  {[`Fixed repayment timeline (${durDays} days)`, "Short-term liquidity exposure", `Simulated institutional risk score: ${100 - inv.riskScore}/100`].map((item) => (
                    <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }}>
                      <span style={{ display: "flex", marginTop: "2px", color: "inherit" }}><CheckCircle2 size={16} /></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section style={{ ...glassCard, borderRadius: "0.75rem", padding: "1.5rem" }}>
              <h3 style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "2rem" }}>Cashflow Timeline</h3>
              <div style={{ position: "relative", display: "flex", justifyContent: "space-between", gap: "0.75rem", overflowX: "auto" }}>
                  <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "1px", background: "rgba(255,255,255,0.1)", transform: "translateY(-0.5px)" }} />
                {timeline.map((step) => (
                  <div key={step.label} style={{ minWidth: isMobile ? "92px" : "auto", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: step.active ? step.color : "rgba(255,255,255,0.05)", border: "4px solid #000", display: "flex", alignItems: "center", justifyContent: "center", color: step.active ? (step.color === "#fff" ? "#000" : "#fff") : "rgba(255,255,255,0.2)" }}>
                      {step.icon}
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: "12px", fontWeight: 700, color: step.active ? step.color : "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>{step.label}</p>
                      <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div style={{ width: isTablet ? "100%" : "340px", flexShrink: 0 }}>
            <div style={{ position: isTablet ? "relative" : "sticky", top: "6rem", ...glassCard, borderRadius: "0.75rem", padding: "1.5rem", boxShadow: "0 0 40px rgba(255,255,255,0.02)" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>Investment Panel</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
                {[
                  { label: "Min Investment", value: "$100.00" },
                  { label: "Available (XLM)", value: wallet ? `${walletBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} XLM` : "Connect wallet" },
                ].map((item) => (
                  <div key={item.label} style={{ background: "rgba(255,255,255,0.05)", padding: "0.75rem", borderRadius: "0.5rem" }}>
                    <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>{item.label}</p>
                    <p style={{ color: "#fff", fontFamily: "monospace" }}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: "2rem" }}>
                <label style={{ display: "block", fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Amount to Invest (USD)</label>
                <div style={{ position: "relative" }}>
                  <input type="number" placeholder="0.00" value={investAmount} onChange={(event) => setInvestAmount(event.target.value)} min="100" max={inv.amount} style={{ width: "100%", background: "#000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", padding: "1rem", paddingRight: "3.5rem", color: "#fff", fontSize: "1.25rem", fontFamily: "monospace", outline: "none", boxSizing: "border-box" }} />
                  <span style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", fontFamily: "monospace", fontSize: "0.875rem" }}>USD</span>
                </div>
                <div style={{ padding: "1rem", background: "rgba(255,255,255,0.05)", borderRadius: "0.5rem", border: "1px solid rgba(255,255,255,0.05)", marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {[{ label: "You will receive (est.)", value: numInvest > 0 ? `$${estReturn}` : "—" }, { label: "Estimated return", value: numInvest > 0 ? `+$${estProfit}` : "—", color: "#0066FF" }].map((row) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.875rem" }}>
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>{row.label}</span>
                      <span style={{ color: row.color ?? "#fff", fontFamily: "monospace" }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={handleFund} disabled={fundLoading} style={{ width: "100%", background: "#fff", color: "#000", border: "none", borderRadius: "0.5rem", padding: "1rem", fontWeight: 900, fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.1em", cursor: fundLoading ? "not-allowed" : "pointer", opacity: fundLoading ? 0.7 : 1, marginBottom: fundError ? "0.75rem" : "1.5rem", fontFamily: "Inter, sans-serif", transition: "all 0.2s" }}>
                {fundLoading ? "Processing..." : "FUND THIS INVOICE"}
              </button>
              {fundError && <p style={{ color: "#f87171", fontSize: "0.78rem", marginTop: "8px", lineHeight: 1.4 }}>{fundError}</p>}
              {fundSuccess && (
                <div style={{ marginTop: "12px", padding: "12px", background: "#052e16", borderRadius: "8px", border: "1px solid #16a34a" }}>
                  <p style={{ color: "#4ade80", fontWeight: 600, marginBottom: "4px" }}>Funded successfully on Stellar testnet</p>
                  <p style={{ color: "#9ca3af", fontSize: "0.72rem" }}>Hash: {fundSuccess.txHash && typeof fundSuccess.txHash === 'string' ? fundSuccess.txHash.substring(0, 24) : "Pending"}...</p>
                  <a href={fundSuccess.explorerUrl} target="_blank" rel="noreferrer" style={{ color: "#60a5fa", fontSize: "0.72rem" }}>View transaction →</a>
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
                {[{ icon: <Lock size={14} />, text: `Funds will be locked until repayment on ${inv.due}. Early liquidation subject to marketplace demand.` }, { icon: <Info size={14} />, text: "All data is for simulation purposes only. No legal liability assumed for simulated data." }].map((note, index) => (
                  <div key={index} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                    <span style={{ color: "rgba(255,255,255,0.3)", marginTop: "2px", display: "flex" }}>{note.icon}</span>
                    <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{note.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
