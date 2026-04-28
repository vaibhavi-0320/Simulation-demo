import React from "react";
import { Bell, User, Check, Lock, Wallet, ArrowRight, Copy } from "lucide-react";
import { useViewport } from "../hooks/useViewport";

interface FundingSuccessProps {
  invoice: { buyer: string; amount: number; duration: number; txId?: string } | null;
  amountInvested: number;
  onViewInvestment: () => void;
  onExploreMore: () => void;
}

export default function FundingSuccess({ invoice, amountInvested, onViewInvestment, onExploreMore }: FundingSuccessProps) {
  const { isMobile } = useViewport();
  const inv = invoice ?? { buyer: "ABC Export Pvt Ltd", amount: 5000, duration: 45, txId: "0x71...3f2" };
  const invested = amountInvested || 500;
  const expectedReturn = (invested * 1.082).toFixed(2);
  const txId = inv.txId || "0x71...3f2";

  const copyTx = () => {
    navigator.clipboard.writeText(txId).catch(() => {});
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>
      {/* Ambient glow */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "800px", height: "300px", background: "rgba(2,102,255,0.05)", filter: "blur(120px)", borderRadius: "50%", pointerEvents: "none", zIndex: 0 }} />

      {/* Header */}
      <header style={{ position: "fixed", top: 0, width: "100%", zIndex: 50, background: "#0a0a0a", borderBottom: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 0 20px rgba(255,255,255,0.03)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "4rem", padding: isMobile ? "0 1rem" : "0 2rem", maxWidth: "1600px", margin: "0 auto" }}>
          <div style={{ fontSize: "1.25rem", fontWeight: 900, letterSpacing: "-0.04em", textTransform: "uppercase" }}>FINTRIX</div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", display: "flex" }}><Bell size={20} /></span>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ display: "flex", color: "#fff" }}><User size={16} /></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ position: "relative", zIndex: 1, minHeight: "100vh", paddingTop: isMobile ? "5.5rem" : "8rem", paddingBottom: isMobile ? "3rem" : "5rem", padding: isMobile ? "5.5rem 1rem 3rem" : "8rem 1.5rem 5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {/* Success icon */}
        <div style={{ textAlign: "center", marginBottom: "3rem", maxWidth: "700px", width: "100%" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "64px", height: "64px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", marginBottom: "1.5rem", filter: "drop-shadow(0 0 12px rgba(255,255,255,0.2))" }}>
            <span style={{ display: "flex", color: "#fff" }}><Check size={32} /></span>
          </div>
          <h1 style={{ fontSize: isMobile ? "1.5rem" : "2rem", fontWeight: 600, color: "#fff", letterSpacing: "-0.03em", marginBottom: "0.25rem" }}>Investment Confirmed</h1>
          <p style={{ fontSize: "1.125rem", color: "rgba(196,199,200,0.7)" }}>Your funds have been successfully allocated to this invoice.</p>
        </div>

        {/* Detail Card */}
        <div style={{ width: "100%", maxWidth: "540px", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: isMobile ? "1.25rem" : "1.5rem", marginBottom: isMobile ? "2rem" : "3rem", position: "relative", overflow: "hidden", boxShadow: "0 0 20px rgba(255,255,255,0.03)" }}>
          {/* Top highlight */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, rgba(255,255,255,0.15), transparent)" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "1rem" : 0 }}>
              <div>
                <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Invoice</p>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>{inv.buyer}</h3>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Duration</p>
                <p style={{ fontFamily: "monospace", color: "#fff" }}>{inv.duration} days</p>
              </div>
            </div>
            <div style={{ height: "1px", background: "rgba(255,255,255,0.1)" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div>
                <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Amount Invested</p>
                <p style={{ fontSize: isMobile ? "1.35rem" : "1.75rem", fontWeight: 600, color: "#fff", letterSpacing: "-0.04em", fontFamily: "monospace" }}>${invested.toLocaleString()}.00</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(177,197,255,0.8)", marginBottom: "4px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0266ff", display: "inline-block" }} />
                  Expected Return
                </p>
                <p style={{ fontSize: isMobile ? "1.35rem" : "1.75rem", fontWeight: 600, color: "#fff", letterSpacing: "-0.04em", fontFamily: "monospace" }}>${expectedReturn}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status info */}
        <div style={{ width: "100%", maxWidth: "540px", display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "3rem" }}>
          {[
            { icon: <Lock size={20} />, text: "Funds are now locked until repayment" },
            { icon: <Wallet size={20} />, text: "You will receive returns upon successful repayment" },
          ].map((n, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "0.5rem" }}>
              <span style={{ color: "rgba(255,255,255,0.4)", display: "flex" }}>{n.icon}</span>
              <p style={{ fontSize: "0.9375rem", color: "rgba(196,199,200,0.9)" }}>{n.text}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", width: "100%", maxWidth: "540px" }}>
          <button onClick={onViewInvestment} style={{ width: "100%", background: "#fff", color: "#000", border: "none", borderRadius: "0.5rem", padding: "1rem", fontWeight: 600, fontSize: "0.9375rem", cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "all 0.2s" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.9")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
          >
            View Investment
          </button>
          <button onClick={onExploreMore} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", fontWeight: 500, cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "0.9375rem", transition: "color 0.2s" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#fff")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)")}
          >
            Explore More Opportunities
            <span style={{ display: "flex" }}><ArrowRight size={18} /></span>
          </button>
        </div>

        {/* TX ID */}
        <div style={{ marginTop: "5rem", textAlign: "center" }}>
          <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: "0.5rem" }}>Transaction ID</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "6px 12px", borderRadius: "9999px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}>
            <a 
              href={`https://stellar.expert/explorer/testnet/tx/${txId}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ fontFamily: "monospace", fontSize: "14px", color: "#0266ff", textDecoration: "none" }}
            >
              {txId.slice(0, 10)}...{txId.slice(-10)}
            </a>
            <button onClick={copyTx} style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center" }}>
              <span style={{ display: "flex" }}><Copy size={14} /></span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
