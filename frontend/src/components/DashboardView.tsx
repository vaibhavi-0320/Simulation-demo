import React, { useEffect, useMemo, useState } from "react";
import { Upload, Cpu, Compass, TrendingUp, ArrowRight } from "lucide-react";
import { getAddress } from "@stellar/freighter-api";
import * as StellarSdk from "@stellar/stellar-sdk";
import type { Invoice } from "../types";
import { useViewport } from "../hooks/useViewport";
import { getUserStorageKey, safeStorage } from "../utils/storage";
import { SkeletonDashboard } from "./PageSkeletons";
import { usePageSkeleton } from "../hooks/usePageSkeleton";

interface DashboardViewProps {
  wallet: string | null;
  invoices: Invoice[];
  onNavigate: (view: string) => void;
  onUpload: () => void;
  onWallet: () => void;
  sidebarOpen: boolean;
}

type PortfolioEntry = {
  txHash: string;
  explorerUrl?: string;
  invoiceId: string;
  company: string;
  amountUSD: number;
  amountXLM: number;
  APY?: number;
  apy?: number;
  fundedAt: string;
  maturityDate: string | null;
  status?: string;
};

type SimulationEntry = {
  simId: string;
  company: string;
  amountUSD: number;
  expectedReturn: number;
  maturityDate: string;
  createdAt?: string;
  simulatedAt?: string;
};

type ActivityEntry = {
  type: string;
  label: string;
  amount: string;
  txHash?: string;
  timestamp: string;
};

type WalletStats = {
  xlmBalance: string;
  totalInvested: number;
  activeDeals: number;
  simulationsRun: number;
  totalReturn: number;
  activity: ActivityEntry[];
  portfolio: PortfolioEntry[];
  simulations: SimulationEntry[];
};

function getPortfolioApy(item: PortfolioEntry) {
  return Number(item.APY ?? item.apy ?? 0);
}

function getSimulationTime(item: SimulationEntry) {
  return item.createdAt || item.simulatedAt || new Date().toISOString();
}

function getChartHeights(portfolio: PortfolioEntry[], simulations: SimulationEntry[]) {
  const values = [
    ...portfolio.slice(0, 6).map((item) => Number(item.amountUSD || 0)),
    ...simulations.slice(0, 4).map((item) => Number(item.expectedReturn || 0) * 10),
  ].filter((value) => value > 0);

  if (!values.length) {
    return [18, 24, 30, 40, 52, 48, 62, 55, 70, 80];
  }

  const max = Math.max(...values, 1);
  const normalized = values.map((value) => Math.max(16, Math.round((value / max) * 88)));
  while (normalized.length < 10) {
    normalized.push(normalized[normalized.length - 1] || 20);
  }
  return normalized.slice(0, 10);
}

export default function DashboardView({
  wallet,
  invoices,
  onNavigate,
  onUpload,
  onWallet,
  sidebarOpen,
}: DashboardViewProps) {
  const { isMobile, isTablet } = useViewport();
  const loading = usePageSkeleton("dashboard");
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [walletStats, setWalletStats] = useState<WalletStats>({
    xlmBalance: "0",
    totalInvested: 0,
    activeDeals: 0,
    simulationsRun: 0,
    totalReturn: 0,
    activity: [],
    portfolio: [],
    simulations: [],
  });

  useEffect(() => {
    async function loadUserData() {
      try {
        const addressResult = await getAddress().catch(() => ({ address: wallet || "" }));
        const address = addressResult?.address || wallet || "";
        if (!address) {
          setWalletStats({
            xlmBalance: "0",
            totalInvested: 0,
            activeDeals: 0,
            simulationsRun: 0,
            totalReturn: 0,
            activity: [],
            portfolio: [],
            simulations: [],
          });
          return;
        }

        const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
        let xlmBalance = "0";
        try {
          const account = await server.loadAccount(address);
          const native = account.balances.find((balance: any) => balance.asset_type === "native");
          xlmBalance = native ? parseFloat(native.balance).toFixed(2) : "0";
        } catch {
          xlmBalance = "0";
        }

        let portfolio = safeStorage.get<PortfolioEntry[]>(getUserStorageKey(address, "portfolio"), []);
        
        // Fix 1: Seed portfolio with existing simulation deals that are funded/active
        if (portfolio.length === 0 && invoices && invoices.length > 0) {
          const fundedDeals = invoices.filter((inv: any) => Number(inv.funded || 0) > 0);
          portfolio = fundedDeals.map((inv: any) => ({
            txHash: `seed-${inv.id}`,
            invoiceId: inv.id,
            company: inv.buyer || inv.companyName || "Unknown",
            amountUSD: Number(inv.funded || inv.amount || 0),
            amountXLM: Number(inv.funded || inv.amount || 0) / 0.11,
            APY: Number(inv.yield || 0),
            fundedAt: new Date().toISOString(),
            maturityDate: inv.due || null,
            status: "active"
          }));
        }

        const simulations = safeStorage.get<SimulationEntry[]>(getUserStorageKey(address, "simulations"), []);
        const activity = safeStorage.get<ActivityEntry[]>(getUserStorageKey(address, "activity"), []);

        const totalInvested = portfolio.reduce((sum, item) => sum + Number(item.amountUSD || 0), 0);
        
        // Fix 3: Active deals should count all deals with 'active' or 'funding' status from marketplace data
        const activeDeals = invoices ? invoices.filter(inv => {
          const s = String(inv.status || "").toLowerCase();
          return s === "funding open" || s === "funding" || s === "active";
        }).length : 0;
        
        // Fix 4: Load simulations run from localStorage
        const simCount = parseInt(localStorage.getItem("simulationsRun") || "1", 10);

        const totalReturn = portfolio.reduce((sum, item) => {
          const apy = getPortfolioApy(item);
          const days = item.fundedAt
            ? (Date.now() - new Date(item.fundedAt).getTime()) / 86_400_000
            : 0;
          return sum + (Number(item.amountUSD || 0) * (apy / 100) * (Math.max(days, 0) / 365));
        }, 0);

        setWalletStats({
          xlmBalance,
          totalInvested,
          activeDeals,
          simulationsRun: simCount,
          totalReturn,
          activity: activity.slice(0, 5),
          portfolio: portfolio.slice(0, 10),
          simulations,
        });
      } catch (error) {
        console.warn("[DASHBOARD] Failed to load user data:", error);
      }
    }

    void loadUserData();
  }, [wallet, invoices]);

  const sideW = isMobile ? "0" : sidebarOpen ? "16rem" : "4.5rem";
  const displayInvoices = invoices.slice(0, 5);
  const barHeights = useMemo(
    () => getChartHeights(walletStats.portfolio, walletStats.simulations),
    [walletStats.portfolio, walletStats.simulations]
  );
  const totalDeployed = walletStats.totalInvested;
  const estimatedYield =
    walletStats.portfolio.length > 0
      ? walletStats.portfolio.reduce((sum, item) => sum + getPortfolioApy(item), 0) / walletStats.portfolio.length
      : 0;
  const healthRatio = walletStats.totalInvested > 0
    ? Math.min(95, Math.max(12, Math.round((walletStats.activeDeals / Math.max(walletStats.portfolio.length, 1)) * 100)))
    : 0;
  const strokeDashoffset = 427 - (427 * healthRatio) / 100;

  if (loading) return <SkeletonDashboard sidebarOpen={sidebarOpen} />;

  return (
    <div
      className="page-fade-in"
      style={{
        marginLeft: sideW,
        minHeight: "100vh",
        background: "#000",
        color: "#e2e2e2",
        fontFamily: "Inter, sans-serif",
        transition: "margin-left 0.28s cubic-bezier(.4,0,.2,1)",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "0 1rem 0 4rem" : "0 2rem",
          height: "5rem",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>
          Dashboard
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "0.5rem" : "1rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button
            onClick={onUpload}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              padding: isMobile ? "0.5rem 0.85rem" : "0.5rem 1.5rem",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "Inter, sans-serif",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
          >
            Upload Invoice
          </button>
          <button
            onClick={() => onNavigate("simulation")}
            style={{
              background: "#fff",
              color: "#000",
              border: "none",
              padding: isMobile ? "0.5rem 0.85rem" : "0.5rem 1.5rem",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "Inter, sans-serif",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.9")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
          >
            Start Simulation
          </button>
          <button
            onClick={onWallet}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.7)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: 700,
              fontFamily: "monospace",
            }}
          >
            {wallet ? wallet.slice(0, 2).toUpperCase() : "?"}
          </button>
        </div>
      </header>

      <main style={{ padding: isMobile ? "1.25rem 1rem 5.5rem" : "2.5rem", maxWidth: "1200px", margin: "0 auto" }}>
        <section style={{ marginBottom: "3rem" }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              marginBottom: "1.5rem",
            }}
          >
            Action Center
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {[
              {
                icon: <Upload size={24} color="#fff" />,
                title: "Upload Invoice",
                desc: "Automate your accounts receivable by digitizing active invoices.",
                action: onUpload,
              },
              {
                icon: <Cpu size={24} color="#fff" />,
                title: "Start Simulation",
                desc: "Run high-fidelity risk models on your current asset distribution.",
                action: () => onNavigate("simulation"),
              },
              {
                icon: <Compass size={24} color="#fff" />,
                title: "Explore Marketplace",
                desc: "Discover liquidity pools and institutional debt instruments.",
                action: () => onNavigate("marketplace"),
              },
            ].map((card, index) => (
              <button
                key={index}
                onClick={card.action}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  backdropFilter: "blur(10px)",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  borderLeft: "1px solid rgba(255,255,255,0.05)",
                  borderRight: "1px solid transparent",
                  borderBottom: "1px solid transparent",
                  boxShadow: "0 0 20px rgba(255,255,255,0.03)",
                  borderRadius: "0.75rem",
                  padding: "2rem",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.3s ease",
                  fontFamily: "Inter, sans-serif",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderTopColor = "rgba(255,255,255,0.4)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 30px rgba(0,102,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderTopColor = "rgba(255,255,255,0.1)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(255,255,255,0.03)";
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "0.5rem",
                    background: "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.5rem",
                  }}
                >
                  <span style={{ display: "flex", color: "#fff" }}>{card.icon}</span>
                </div>
                <h4
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: "#fff",
                    marginBottom: "0.5rem",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {card.title}
                </h4>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", lineHeight: 1.5 }}>
                  {card.desc}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: "3rem" }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              marginBottom: "0.5rem",
            }}
          >
            Total Portfolio Value
          </p>
          <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "baseline", flexDirection: isMobile ? "column" : "row", gap: "1rem", marginBottom: "2rem" }}>
            <h1
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.04em",
              }}
            >
              ${totalDeployed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>
            <span style={{ color: "#0066FF", fontSize: "1.125rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
              <TrendingUp size={18} />
              ${walletStats.totalReturn.toFixed(2)} est.
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.5rem" }}>
            {[
              { label: "Total Invested", value: `$${walletStats.totalInvested.toLocaleString()}` },
              { label: "XLM Balance", value: `${walletStats.xlmBalance} XLM` },
              { label: "Active Deals", value: String(walletStats.activeDeals) },
              { label: "Simulations Run", value: String(walletStats.simulationsRun) },
              { label: "Estimated Return", value: `$${walletStats.totalReturn.toFixed(2)}` },
            ].map((stat, index) => (
              <div key={index} style={{ paddingLeft: isMobile ? "0" : "1.5rem", borderLeft: isMobile ? "none" : "1px solid rgba(255,255,255,0.1)" }}>
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.4)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {stat.label}
                </p>
                <p style={{ fontSize: "1.5rem", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
            marginBottom: "3rem",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              backdropFilter: "blur(10px)",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              borderLeft: "1px solid rgba(255,255,255,0.05)",
              borderRight: "1px solid transparent",
              borderBottom: "1px solid transparent",
              borderRadius: "0.75rem",
              padding: "2rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
              <h4 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>
                Yield Velocity
              </h4>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Wallet Activity
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "12rem" }}>
              {barHeights.map((height, index) => (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredBar(index)}
                  onMouseLeave={() => setHoveredBar(null)}
                  style={{
                    flex: 1,
                    height: `${height}%`,
                    borderRadius: "2px 2px 0 0",
                    background:
                      hoveredBar === index
                        ? "rgba(255,255,255,0.3)"
                        : index === barHeights.length - 1
                        ? "rgba(0,102,255,0.6)"
                        : `rgba(255,255,255,${height > 70 ? "0.2" : height > 50 ? "0.1" : "0.05"})`,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              backdropFilter: "blur(10px)",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              borderLeft: "1px solid rgba(255,255,255,0.05)",
              borderRight: "1px solid transparent",
              borderBottom: "1px solid transparent",
              borderRadius: "0.75rem",
              padding: "2rem",
              display: "flex",
              flexDirection: isTablet ? "column" : "row",
              alignItems: isTablet ? "flex-start" : "center",
              gap: "2rem",
            }}
          >
            <div style={{ position: "relative", width: "160px", height: "160px", flexShrink: 0 }}>
              <svg width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="80" cy="80" r="68" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  fill="transparent"
                  stroke="#fff"
                  strokeWidth="8"
                  strokeDasharray="427"
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "1.75rem", fontWeight: 900, color: "#fff" }}>{healthRatio}%</span>
                <span
                  style={{
                    fontSize: "10px",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.1em",
                  }}
                >
                  Health
                </span>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#fff", marginBottom: "0.5rem" }}>
                Portfolio Health
              </h4>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", marginBottom: "1.5rem", maxWidth: "220px" }}>
                Live wallet activity, active positions, and average APY are reflected here.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  { color: "#fff", label: `Average APY: ${estimatedYield.toFixed(1)}%` },
                  { color: "#0066FF", label: `Wallet Balance: ${walletStats.xlmBalance} XLM` },
                ].map((item, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "12px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                    <span style={{ color: "rgba(255,255,255,0.6)" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", marginBottom: "3rem" }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>Portfolio</h3>
            {walletStats.portfolio.length === 0 ? (
              <div style={{ textAlign: "center", color: "#6b7280", padding: "40px" }}>
                <p>No investments yet.</p>
                <p style={{ fontSize: "0.85rem", marginTop: "8px" }}>
                  Go to Marketplace to fund your first invoice.
                </p>
              </div>
            ) : (
              walletStats.portfolio.map((item, index) => (
                <div
                  key={`${item.txHash}-${index}`}
                  style={{
                    padding: "16px",
                    background: "#0f172a",
                    borderRadius: "8px",
                    border: "1px solid #1e293b",
                    marginBottom: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <p style={{ color: "#fff", fontWeight: 600 }}>{item.company}</p>
                    <p style={{ color: "#6b7280", fontSize: "0.75rem" }}>
                      {new Date(item.fundedAt).toLocaleDateString()} · {getPortfolioApy(item)}% APY
                    </p>
                    {item.explorerUrl ? (
                      <a href={item.explorerUrl} target="_blank" rel="noreferrer" style={{ color: "#818cf8", fontSize: "0.7rem" }}>
                        View on Stellar →
                      </a>
                    ) : null}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ color: "#4ade80", fontWeight: 700 }}>${item.amountUSD?.toLocaleString()}</p>
                    <span
                      style={{
                        background: "#052e16",
                        color: "#4ade80",
                        padding: "2px 10px",
                        borderRadius: "999px",
                        fontSize: "0.7rem",
                      }}
                    >
                      {(item.status || "active").toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>Recent Activity</h3>
            {walletStats.activity.length === 0 ? (
              <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>No activity yet.</p>
            ) : (
              walletStats.activity.map((item, index) => (
                <div
                  key={`${item.txHash || item.timestamp}-${index}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: "1px solid #1e293b",
                    gap: "1rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "1rem" }}>
                      {item.type === "funded" ? "💰" : item.type === "simulation" ? "🧪" : "📄"}
                    </span>
                    <div>
                      <p style={{ color: "#e2e8f0", fontSize: "0.85rem" }}>{item.label}</p>
                      <p style={{ color: "#6b7280", fontSize: "0.7rem" }}>
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span style={{ color: "#4ade80", fontWeight: 600, fontSize: "0.85rem" }}>
                    {item.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "flex-end", flexDirection: isMobile ? "column" : "row", gap: "1rem", marginBottom: "2rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>
                  Active Invoices
                </h3>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "4px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Simulation Data
                </span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>
                Real-time status of your accounts receivable and financing.
              </p>
            </div>
            <button
              onClick={() => onNavigate("marketplace")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.6)",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#fff")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)")}
            >
              View All
              <span style={{ display: "flex", marginLeft: "4px" }}><ArrowRight size={16} /></span>
            </button>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              backdropFilter: "blur(10px)",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              borderLeft: "1px solid rgba(255,255,255,0.05)",
              borderRight: "1px solid transparent",
              borderBottom: "1px solid transparent",
              borderRadius: "0.75rem",
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: isMobile ? "720px" : "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {["Reference", "Client", "Amount", "Maturity", "Status"].map((heading, index) => (
                      <th
                        key={heading}
                        style={{
                          padding: "1rem 2rem",
                          textAlign: index === 2 ? "right" : index === 4 ? "center" : "left",
                          fontSize: "12px",
                          fontWeight: 600,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "rgba(255,255,255,0.4)",
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayInvoices.map((invoice, index) => (
                    <tr
                      key={invoice.id || index}
                      style={{ borderTop: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", transition: "background 0.2s" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.03)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                      onClick={() => onNavigate("deal-detail")}
                    >
                      <td style={{ padding: "1.5rem 2rem", fontFamily: "monospace", color: "#fff", fontSize: "0.875rem" }}>
                        {invoice.id}
                      </td>
                      <td style={{ padding: "1.5rem 2rem", color: "#fff", fontWeight: 500 }}>
                        {invoice.companyName || invoice.buyer}
                      </td>
                      <td style={{ padding: "1.5rem 2rem", color: "#fff", textAlign: "right", fontFamily: "monospace" }}>
                        ${Number(invoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: "1.5rem 2rem", color: "rgba(255,255,255,0.6)", fontSize: "0.875rem" }}>
                        {invoice.due}
                      </td>
                      <td style={{ padding: "1.5rem 2rem", textAlign: "center" }}>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: "9999px",
                            border: invoice.status === "funded" ? "1px solid rgba(0,102,255,0.4)" : "1px solid rgba(255,255,255,0.1)",
                            background: invoice.status === "funded" ? "rgba(0,102,255,0.05)" : "rgba(255,255,255,0.05)",
                            color: invoice.status === "funded" ? "#0066FF" : "rgba(255,255,255,0.4)",
                            fontSize: "10px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                          }}
                        >
                          {invoice.status === "funded" ? "Funding" : invoice.status === "active" ? "Pending" : invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
