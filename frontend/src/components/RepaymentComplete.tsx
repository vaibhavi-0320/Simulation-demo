import React from "react";
import { Bell, CheckCircle2, Wallet, Copy } from "lucide-react";
import { useViewport } from "../hooks/useViewport";

interface RepaymentCompleteProps {
  invoice: { buyer: string; amount: number; txId?: string; completedDate?: string } | null;
  amountInvested: number;
  onReinvest: () => void;
  onViewDetails: () => void;
}

export default function RepaymentComplete({ invoice, amountInvested, onReinvest, onViewDetails }: RepaymentCompleteProps) {
  const { isMobile } = useViewport();
  const inv = invoice ?? { buyer: "ABC Export Pvt Ltd", amount: 5000, txId: "0x9a...b14", completedDate: "2024-05-15" };
  const invested = amountInvested || 500;
  const returned = +(invested * 1.08).toFixed(0);
  const profit = returned - invested;
  const txId = inv.txId || "0x9a...b14";
  const dateCompleted = inv.completedDate ?? new Date().toISOString().split("T")[0];

  const copyTx = () => {
    navigator.clipboard.writeText(txId).catch(() => {});
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#e2e2e2", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <header style={{ position: "fixed", top: 0, width: "100%", zIndex: 50, background: "#0a0a0a", borderBottom: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 0 20px rgba(255,255,255,0.03)", fontFamily: "Inter, sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "4rem", padding: isMobile ? "0 1rem" : "0 2rem", maxWidth: "1600px", margin: "0 auto" }}>
          <div style={{ fontSize: "1.25rem", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", textTransform: "uppercase" }}>FINTRIX</div>
          {!isMobile && (
            <nav style={{ display: "flex", alignItems: "center", gap: "2rem", fontSize: "0.875rem", fontWeight: 500 }}>
              <a href="#" style={{ color: "#fff", borderBottom: "2px solid #0066FF", paddingBottom: "1rem", marginBottom: "-17px", textDecoration: "none" }}>Portfolio</a>
              {["Trade", "Vaults", "Activity"].map((item) => (
                <a key={item} href="#" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.8)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.4)")}
                >
                  {item}
                </a>
              ))}
            </nav>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: "0.5rem", borderRadius: "4px" }}>
              <span style={{ display: "flex" }}><Bell size={20} /></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: isMobile ? "5rem 1rem 4rem" : "4rem 1.5rem 6rem" }}>
        <div style={{ width: "100%", maxWidth: "700px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          {/* Icon */}
          <div style={{ marginBottom: "3rem", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,102,255,0.1)", filter: "blur(48px)", borderRadius: "50%" }} />
            <div style={{ position: "relative", width: "80px", height: "80px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 40px rgba(255,255,255,0.05)" }}>
              <span style={{ display: "flex", color: "#fff" }}><CheckCircle2 size={40} /></span>
            </div>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: "3rem" }}>
            <h1 style={{ fontSize: isMobile ? "1.5rem" : "2rem", fontWeight: 600, color: "#fff", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>Repayment Complete</h1>
            <p style={{ fontSize: "1.125rem", color: "rgba(255,255,255,0.4)", maxWidth: "400px" }}>The invoice has been successfully repaid.</p>
          </div>

          {/* Earnings Card */}
          <div style={{ width: "100%", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: isMobile ? "1.5rem" : "3rem", boxShadow: "0 0 20px rgba(255,255,255,0.03)", position: "relative", overflow: "hidden", marginBottom: isMobile ? "2rem" : "3rem" }}>
            <div style={{ position: "absolute", inset: 0, border: "1px solid rgba(255,255,255,0.05)", borderRadius: "0.75rem", pointerEvents: "none" }} />
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "1.5rem", position: "relative", zIndex: 1 }}>
              {[
                { label: "Invested", value: `$${invested.toLocaleString()}`, align: "flex-start" },
                { label: "Returned", value: `$${returned.toLocaleString()}`, align: "flex-start" },
                { label: "Profit", value: `+$${profit.toLocaleString()}`, align: "flex-end", color: "#0066FF", large: true },
              ].map((s, i) => (
                <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: isMobile ? "flex-start" : (i === 2 ? "flex-end" : "flex-start"), position: "relative" }}>
                  {i > 0 && (
                    <div style={{ position: "absolute", left: "-1.5rem", top: 0, bottom: 0, width: "1px", background: "rgba(255,255,255,0.05)", display: isMobile ? "none" : (i === 1 ? "block" : "none") }} />
                  )}
                  <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "0.5rem" }}>{s.label}</span>
                  <span style={{ fontSize: s.large ? "2.5rem" : "1.5rem", fontWeight: 600, color: s.color ?? "#fff", letterSpacing: "-0.03em", fontFamily: "monospace" }}>{s.value}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <span style={{ color: "#0066FF", display: "flex" }}><Wallet size={16} /></span>
              <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.6)" }}>Funds have been returned to your wallet</p>
            </div>
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1.5rem", width: "100%", justifyContent: "center", flexWrap: "wrap", marginBottom: "3rem" }}>
            <button onClick={onReinvest} style={{ background: "#fff", color: "#000", border: "none", borderRadius: "0.5rem", padding: "1rem 3rem", fontWeight: 700, fontSize: "0.9375rem", cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "opacity 0.2s" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.9")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
            >
              Reinvest Now
            </button>
            <button onClick={onViewDetails} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", padding: "1rem 2rem", fontWeight: 500, fontSize: "0.9375rem", cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "color 0.2s" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#fff")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)")}
            >
              View Details
            </button>
          </div>

          {/* Tx Metadata */}
          <div style={{ paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.05)", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", flexDirection: isMobile ? "column" : "row" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>Transaction ID</span>
              <a 
                href={`https://stellar.expert/explorer/testnet/tx/${txId}`} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ fontFamily: "monospace", color: "#0066FF", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "4px", fontSize: "14px", textDecoration: "none" }}
              >
                {txId.slice(0, 8)}...{txId.slice(-8)}
              </a>
              <button onClick={copyTx} style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.2)")}
              >
                <span style={{ display: "flex" }}><Copy size={16} /></span>
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>Date Completed</span>
              <span style={{ fontFamily: "monospace", color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>{dateCompleted}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
