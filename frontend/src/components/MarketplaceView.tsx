import React, { useState, useMemo } from "react";
import { useViewport } from "../hooks/useViewport";
import { SkeletonMarketplace } from "./PageSkeletons";
import { usePageSkeleton } from "../hooks/usePageSkeleton";

interface Invoice {
  id: string;
  buyer: string;
  amount: number;
  due: string;
  status: string;
  yield: number;
  riskScore: number;
}

interface MarketplaceViewProps {
  invoices: Invoice[];
  onFund: (id: string) => Promise<void>;
  onViewDetail: (id: string) => void;
  sidebarOpen: boolean;
}

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(10px)",
  borderTop: "1px solid rgba(255,255,255,0.1)",
  borderLeft: "1px solid rgba(255,255,255,0.05)",
  borderRight: "1px solid transparent",
  borderBottom: "1px solid transparent",
  boxShadow: "0 0 20px rgba(255,255,255,0.03)",
};

export default function MarketplaceView({ invoices, onFund, onViewDetail, sidebarOpen }: MarketplaceViewProps) {
  const { isMobile, isTablet } = useViewport();
  const loading = usePageSkeleton("marketplace");
  const [statusTab, setStatusTab] = useState<"all" | "active" | "funded" | "repaid">("all");
  const [minApy, setMinApy] = useState(0);
  const [maxDuration, setMaxDuration] = useState(120);
  const [riskFilter, setRiskFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [search, setSearch] = useState("");
  // FIXED: Bug 3 — simulator modal state
  const [simOpen, setSimOpen] = useState(false);
  const [simAmount, setSimAmount] = useState(5000);
  const [simApy, setSimApy] = useState(10);
  const [simDuration, setSimDuration] = useState(90);

  const sideW = isMobile ? "0" : sidebarOpen ? "16rem" : "4.5rem";

  // FIXED: Bug 3 — calculate simulator outputs
  const simReturn = simAmount * (simApy / 100) * (simDuration / 365);
  const simTotal = simAmount + simReturn;

  const filtered = useMemo(() => {
    const base = invoices.length > 0 ? invoices : [
      { id: "INV-8829-X", buyer: "TechLogistics Ltd", amount: 45000, due: "2024-12-01", status: "active", yield: 12.5, riskScore: 20 },
      { id: "INV-4412-Q", buyer: "Quantum Global", amount: 12750, due: "2024-11-15", status: "active", yield: 9.2, riskScore: 50 },
      { id: "INV-9901-S", buyer: "Solaris Networks", amount: 5400, due: "2025-02-01", status: "funded", yield: 10.8, riskScore: 45 },
    ];
    return base.filter((inv) => {
      const byStatus = statusTab === "all" || inv.status === statusTab;
      const byApy = inv.yield >= minApy;
      const riskLevel = inv.riskScore < 40 ? "low" : inv.riskScore < 65 ? "medium" : "high";
      const byRisk = riskFilter === "all" || riskLevel === riskFilter;
      const bySearch = !search || inv.buyer.toLowerCase().includes(search.toLowerCase()) || inv.id.toLowerCase().includes(search.toLowerCase());
      return byStatus && byApy && byRisk && bySearch;
    });
  }, [invoices, statusTab, minApy, riskFilter, search]);

  const totalVolume = useMemo(() => invoices.reduce((s: number, i: any) => s + i.amount, 0), [invoices]);

  if (loading) return <SkeletonMarketplace sidebarOpen={sidebarOpen} />;

  const fundingPct = (inv: Invoice) => {
    if (inv.status === "funded" || inv.status === "repaid") return 100;
    if (inv.status === "active") return Math.floor(15 + (inv.riskScore * 0.5));
    return 0;
  };

  return (
    <div className="page-fade-in" style={{ marginLeft: sideW, minHeight: "100vh", background: "#000", color: "#e2e2e2", fontFamily: "Inter, sans-serif", transition: "margin-left 0.28s cubic-bezier(.4,0,.2,1)" }}>
      {/* TopBar */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(10,10,10,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "0 1rem 0 4rem" : "0 2rem", height: "4rem", gap: "1rem" }}>
        <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>Marketplace / Opportunities</span>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: isMobile ? 1 : "unset", justifyContent: "flex-end" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "1rem", color: "rgba(255,255,255,0.4)" }}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Invoices..."
              style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", padding: "0.375rem 1rem 0.375rem 2.5rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.8)", outline: "none", width: isMobile ? "min(52vw, 220px)" : "220px", fontFamily: "Inter, sans-serif" }}
            />
          </div>
          {/* FIXED: Bug 4 (Option B) — removed non-functional bell/settings icons */}
        </div>
      </header>

      <div style={{ padding: isMobile ? "1.25rem 1rem 5.5rem" : "2.5rem", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <section style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "flex-end", gap: "1.5rem", marginBottom: "3rem", flexWrap: "wrap", flexDirection: isMobile ? "column" : "row" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 600, color: "#fff", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>Invoice Opportunities</h1>
            <p style={{ color: "#c4c7c8", fontSize: "0.9375rem" }}>Browse available invoices, evaluate risk and yield, and fund opportunities.</p>
          </div>
          <div style={{ ...glassCard, padding: "1.5rem", borderRadius: "0.75rem", minWidth: "220px" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c4c7c8", marginBottom: "0.25rem" }}>Total Marketplace Volume</p>
            <p style={{ fontSize: "2rem", fontWeight: 600, color: "#fff", letterSpacing: "-0.03em" }}>${(totalVolume / 1000).toFixed(1)}K</p>
          </div>
        </section>

        {/* Filters */}
        <section style={{ ...glassCard, borderRadius: "0.75rem", padding: "2rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", background: "rgba(255,255,255,0.05)", width: "100%", borderRadius: "0.5rem", padding: "4px", marginBottom: "2rem", overflowX: "auto" }}>
            {(["all", "active", "funded", "repaid"] as const).map((tab) => (
              <button key={tab} onClick={() => setStatusTab(tab)} style={{ padding: "0.5rem 1.5rem", borderRadius: "6px", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer", border: "none", fontFamily: "Inter, sans-serif", background: statusTab === tab ? "rgba(255,255,255,0.1)" : "transparent", color: statusTab === tab ? "#fff" : "rgba(255,255,255,0.4)", transition: "all 0.2s" }}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "2rem", alignItems: "flex-end" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#c4c7c8" }}>Min APY</label>
                <span style={{ color: "#fff", fontFamily: "monospace", fontSize: "0.875rem" }}>{minApy}%</span>
              </div>
              <input type="range" min="0" max="20" value={minApy} onChange={(e) => setMinApy(Number(e.target.value))} style={{ width: "100%", accentColor: "#fff", height: "4px" }} />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#c4c7c8" }}>Max Duration</label>
                <span style={{ color: "#fff", fontFamily: "monospace", fontSize: "0.875rem" }}>{maxDuration}d</span>
              </div>
              <input type="range" min="7" max="180" value={maxDuration} onChange={(e) => setMaxDuration(Number(e.target.value))} style={{ width: "100%", accentColor: "#fff", height: "4px" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#c4c7c8", marginBottom: "1rem" }}>Risk Level</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {(["all", "low", "medium", "high"] as const).map((r) => (
                  <button key={r} onClick={() => setRiskFilter(r)} style={{ flex: 1, padding: "0.5rem 0", background: riskFilter === r ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)", border: riskFilter === r ? "1px solid rgba(255,255,255,0.4)" : "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: riskFilter === r ? "#fff" : "rgba(255,255,255,0.8)", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => { setStatusTab("all"); setMinApy(0); setMaxDuration(120); setRiskFilter("all"); setSearch(""); }} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                <span style={{ fontSize: "1.125rem", fontWeight: 700 }}>↺</span> Clear Filters
              </button>
            </div>
          </div>
        </section>

        {/* Grid + Side */}
        <div style={{ display: "grid", gridTemplateColumns: isTablet ? "1fr" : "1fr 280px", gap: "2rem" }}>
          {/* Invoice Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {filtered.length === 0 ? (
              <div style={{ ...glassCard, borderRadius: "1rem", padding: "4rem", textAlign: "center" }}>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "1rem" }}>No invoices match your filters.</p>
              </div>
            ) : filtered.map((inv, idx) => {
              const pct = fundingPct(inv);
              const riskLabel = inv.riskScore < 40 ? "A+" : inv.riskScore < 65 ? "B" : "B+";
              const durDays = Math.max(1, Math.ceil((new Date(inv.due).getTime() - Date.now()) / (1000 * 86400)));
              return (
                <div key={inv.id || idx} style={{ ...glassCard, borderRadius: "1rem", padding: "2rem", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", gap: "2rem", alignItems: isMobile ? "stretch" : "center", transition: "border-top-color 0.3s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderTopColor = "rgba(255,255,255,0.2)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderTopColor = "rgba(255,255,255,0.1)")}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexDirection: isMobile ? "column" : "row", gap: "1rem", marginBottom: "1.5rem" }}>
                      <div>
                        <h3 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>{inv.buyer}</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ padding: "2px 8px", background: "rgba(2,102,255,0.2)", color: "#b3c5ff", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", borderRadius: "4px" }}>Simulation Data</span>
                          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>• {inv.id}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", color: "#0266ff", gap: "4px", marginBottom: "4px" }}>
                          <span style={{ fontSize: "14px", fontWeight: 900 }}>✓</span>
                          <span style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em" }}>Funding Open</span>
                        </div>
                        <p style={{ fontSize: "1.5rem", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>${inv.amount.toLocaleString()}.00</p>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "1rem", padding: "1.5rem 0", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: "1.5rem" }}>
                      {[
                        { label: "Yield (APY)", value: `${inv.yield}%` },
                        { label: "Duration", value: `${durDays} Days` },
                        { label: "Risk Rating", value: riskLabel },
                      ].map((stat) => (
                        <div key={stat.label}>
                          <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#c4c7c8", marginBottom: "4px" }}>{stat.label}</p>
                          <p style={{ color: "#fff", fontFamily: "monospace", fontSize: "1.125rem" }}>{stat.value}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontFamily: "monospace", marginBottom: "0.5rem" }}>
                        <span style={{ color: "rgba(255,255,255,0.6)" }}>${(inv.amount * pct / 100).toLocaleString()} Funded</span>
                        <span style={{ color: "#fff" }}>{pct}% Complete</span>
                      </div>
                      <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "9999px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: "#0266ff", transition: "width 0.5s ease" }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ width: isMobile ? "100%" : "auto" }}>
                    <button
                      onClick={() => onViewDetail(inv.id)}
                      style={{ padding: "0.75rem 1.5rem", background: "#fff", color: "#000", border: "none", borderRadius: "0.5rem", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "Inter, sans-serif", transition: "opacity 0.2s", minWidth: "120px", width: isMobile ? "100%" : "auto" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.9")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Side Panel */}
          <aside style={{ position: isTablet ? "relative" : "sticky", top: "5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ ...glassCard, borderRadius: "1rem", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#0266ff" }}>
                <span style={{ fontSize: "1.25rem" }}>🛡️</span>
                <h4 style={{ fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.05em", color: "#fff", textTransform: "uppercase" }}>Risk Detector</h4>
              </div>
              <p style={{ fontSize: "0.9375rem", color: "#c4c7c8", lineHeight: 1.6 }}>
                Fintrix algorithms have detected optimal liquidity in the <strong style={{ color: "#fff" }}>10–12% APY range</strong>. Diversify across sectors to mitigate industry-specific risks.
              </p>
              <div style={{ padding: "1rem", background: "rgba(255,255,255,0.05)", borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>Market Health</span>
                  <span style={{ fontSize: "12px", color: "#4ade80", fontFamily: "monospace" }}>Stable</span>
                </div>
                <div style={{ height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "9999px" }}>
                  <div style={{ height: "100%", width: "75%", background: "rgba(74,222,128,0.6)", borderRadius: "9999px" }} />
                </div>
              </div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
                <a href="#" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none" }}>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Risk Framework Documentation</span>
                  <span style={{ fontSize: "1.25rem", color: "rgba(255,255,255,0.2)" }}>→</span>
                </a>
              </div>
            </div>
            <div style={{ ...glassCard, borderRadius: "1rem", padding: "1.5rem", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "relative", zIndex: 1 }}>
                <h4 style={{ fontWeight: 700, fontSize: "0.875rem", color: "#fff", marginBottom: "0.5rem" }}>Simulate Returns</h4>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "1rem" }}>Use our Web3 engine to forecast yields over a 12-month period.</p>
                <button
                  onClick={() => {
                    setSimOpen(true);
                    // Fix 4: Increment simulations run counter on simulator action
                    const current = parseInt(localStorage.getItem('simulationsRun') || '0', 10);
                    localStorage.setItem('simulationsRun', String(current + 1));
                  }}
                  style={{ width: "100%", padding: "0.5rem", background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: "0.5rem", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.15)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)")}
                >
                  Launch Simulator
                </button>
              </div>
              <span style={{ position: "absolute", right: "-16px", bottom: "-16px", fontSize: "8rem", color: "rgba(255,255,255,0.05)" }}>📈</span>
            </div>
          </aside>
        </div>
      </div>

      {/* FIXED: Bug 3 — Returns Simulator Modal */}
      {simOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={() => setSimOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} />
          <div style={{ position: "relative", width: "calc(100vw - 2rem)", maxWidth: "480px", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "1rem", padding: "2rem", boxShadow: "0 30px 80px rgba(0,0,0,0.6)", maxHeight: "85vh", overflowY: "auto" }}>
            <button onClick={() => setSimOpen(false)} style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em", marginBottom: "0.25rem" }}>Returns Simulator</h3>
            <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)", marginBottom: "2rem" }}>Forecast your potential yield based on investment parameters.</p>

            {/* Investment Amount */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>Investment Amount</label>
                <span style={{ color: "#fff", fontFamily: "monospace", fontSize: "0.875rem" }}>${simAmount.toLocaleString()}</span>
              </div>
              <input type="range" min="100" max="50000" step="100" value={simAmount} onChange={(e) => setSimAmount(Number(e.target.value))} style={{ width: "100%", accentColor: "#0266ff", height: "4px" }} />
            </div>

            {/* APY */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>APY</label>
                <span style={{ color: "#fff", fontFamily: "monospace", fontSize: "0.875rem" }}>{simApy}%</span>
              </div>
              <input type="range" min="5" max="20" step="0.5" value={simApy} onChange={(e) => setSimApy(Number(e.target.value))} style={{ width: "100%", accentColor: "#0266ff", height: "4px" }} />
            </div>

            {/* Duration */}
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>Duration</label>
                <span style={{ color: "#fff", fontFamily: "monospace", fontSize: "0.875rem" }}>{simDuration} days</span>
              </div>
              <input type="range" min="30" max="365" step="1" value={simDuration} onChange={(e) => setSimDuration(Number(e.target.value))} style={{ width: "100%", accentColor: "#0266ff", height: "4px" }} />
            </div>

            {/* Results */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ background: "rgba(255,255,255,0.05)", padding: "1rem", borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "0.25rem" }}>Estimated Return</p>
                <p style={{ fontSize: "1.5rem", fontWeight: 600, color: "#0266ff", fontFamily: "monospace", letterSpacing: "-0.02em" }}>+${simReturn.toFixed(2)}</p>
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", padding: "1rem", borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "0.25rem" }}>Total Received</p>
                <p style={{ fontSize: "1.5rem", fontWeight: 600, color: "#fff", fontFamily: "monospace", letterSpacing: "-0.02em" }}>${simTotal.toFixed(2)}</p>
              </div>
            </div>

            {/* Mock Testnet Preview */}
            <div style={{ padding: "1rem", background: "rgba(2,102,255,0.08)", border: "1px solid rgba(2,102,255,0.2)", borderRadius: "0.5rem", marginBottom: "1.5rem", fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)" }}>
              <p style={{ fontWeight: 600, color: "#0266ff", marginBottom: "0.25rem" }}>Stellar Testnet Preview</p>
              <p>Send {(simAmount / 500).toFixed(1)} XLM → Escrow → Receive {(simTotal / 500).toFixed(1)} XLM after {simDuration} days</p>
            </div>

            <button onClick={() => setSimOpen(false)} style={{ width: "100%", padding: "0.75rem", background: "#fff", color: "#000", border: "none", borderRadius: "0.5rem", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              Close Simulator
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
