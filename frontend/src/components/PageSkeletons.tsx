import type { CSSProperties, ReactNode } from "react";
import { useViewport } from "../hooks/useViewport";

interface ShellProps {
  sidebarOpen: boolean;
  headerHeight?: string;
  children: ReactNode;
}

interface SkeletonBlockProps {
  width?: CSSProperties["width"];
  height: CSSProperties["height"];
  borderRadius?: CSSProperties["borderRadius"];
  style?: CSSProperties;
}

export function SkeletonBlock({
  width = "100%",
  height,
  borderRadius = "8px",
  style,
}: SkeletonBlockProps) {
  return <div className="skeleton" style={{ width, height, borderRadius, ...style }} />;
}

function SkeletonShell({ sidebarOpen, headerHeight = "5rem", children }: ShellProps) {
  const { isMobile } = useViewport();
  const sideW = isMobile ? "0" : sidebarOpen ? "16rem" : "4.5rem";

  return (
    <div
      style={{
        marginLeft: sideW,
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
        transition: "margin-left 0.28s cubic-bezier(.4,0,.2,1)",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          height: headerHeight,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(12px)",
        }}
      />
      {children}
    </div>
  );
}

export function SkeletonDashboard({ sidebarOpen }: { sidebarOpen: boolean }) {
  const { isMobile } = useViewport();

  return (
    <SkeletonShell sidebarOpen={sidebarOpen}>
      <main style={{ padding: isMobile ? "1.25rem 1rem 5.5rem" : "2.5rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <SkeletonBlock width="180px" height="12px" style={{ marginBottom: "1rem" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
            {[0, 1, 2].map((item) => (
              <div key={item} style={{ padding: "2rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <SkeletonBlock width="48px" height="48px" borderRadius="12px" style={{ marginBottom: "1.25rem" }} />
                <SkeletonBlock width="140px" height="20px" style={{ marginBottom: "0.75rem" }} />
                <SkeletonBlock width="100%" height="14px" style={{ marginBottom: "0.4rem" }} />
                <SkeletonBlock width="72%" height="14px" />
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "2.5rem" }}>
          <SkeletonBlock width="120px" height="12px" style={{ marginBottom: "0.85rem" }} />
          <SkeletonBlock width="280px" height="52px" style={{ marginBottom: "2rem" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.5rem" }}>
            {[0, 1, 2, 3].map((item) => (
              <div key={item}>
                <SkeletonBlock width="90px" height="10px" style={{ marginBottom: "0.65rem" }} />
                <SkeletonBlock width="140px" height="28px" />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", marginBottom: "2.5rem" }}>
          <div style={{ padding: "2rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <SkeletonBlock width="160px" height="20px" style={{ marginBottom: "1.5rem" }} />
            <SkeletonBlock width="100%" height="210px" borderRadius="10px" />
          </div>
          <div style={{ padding: "2rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <SkeletonBlock width="140px" height="20px" style={{ marginBottom: "1.5rem" }} />
            <SkeletonBlock width="100%" height="210px" borderRadius="10px" />
          </div>
        </div>

        <div style={{ padding: "1.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <SkeletonBlock width="170px" height="22px" style={{ marginBottom: "1.5rem" }} />
          {[0, 1, 2, 3].map((row) => (
            <div key={row} style={{ display: "grid", gridTemplateColumns: "1.1fr 1.2fr 0.9fr 0.9fr 0.8fr", gap: "1rem", padding: "1rem 0", borderTop: row === 0 ? "none" : "1px solid rgba(255,255,255,0.05)" }}>
              <SkeletonBlock height="16px" />
              <SkeletonBlock height="16px" />
              <SkeletonBlock height="16px" />
              <SkeletonBlock height="16px" />
              <SkeletonBlock height="24px" borderRadius="999px" />
            </div>
          ))}
        </div>
      </main>
    </SkeletonShell>
  );
}

export function SkeletonMarketplace({ sidebarOpen }: { sidebarOpen: boolean }) {
  const { isMobile, isTablet } = useViewport();

  return (
    <SkeletonShell sidebarOpen={sidebarOpen} headerHeight="4rem">
      <main style={{ padding: isMobile ? "1.25rem 1rem 5.5rem" : "2.5rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "1.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          <div style={{ minWidth: "260px", flex: 1 }}>
            <SkeletonBlock width="240px" height="34px" style={{ marginBottom: "0.75rem" }} />
            <SkeletonBlock width="380px" height="14px" style={{ maxWidth: "100%" }} />
          </div>
          <SkeletonBlock width="220px" height="92px" borderRadius="12px" />
        </div>

        <div style={{ padding: "2rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", marginBottom: "2rem" }}>
          <SkeletonBlock width="100%" height="40px" borderRadius="10px" style={{ marginBottom: "1.5rem" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.5rem" }}>
            {[0, 1, 2, 3].map((item) => (
              <div key={item}>
                <SkeletonBlock width="88px" height="10px" style={{ marginBottom: "0.75rem" }} />
                <SkeletonBlock width="100%" height="38px" borderRadius="10px" />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isTablet ? "1fr" : "1fr 280px", gap: "2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {[0, 1, 2].map((item) => (
              <div key={item} style={{ padding: "2rem", minHeight: "360px", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div style={{ flex: 1 }}>
                    <SkeletonBlock width="160px" height="24px" style={{ marginBottom: "0.65rem" }} />
                    <SkeletonBlock width="120px" height="12px" />
                  </div>
                  <SkeletonBlock width="90px" height="24px" borderRadius="999px" />
                </div>
                <div style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
                  {[0, 1, 2].map((line) => (
                    <div key={line}>
                      <SkeletonBlock width="90px" height="10px" style={{ marginBottom: "0.45rem" }} />
                      <SkeletonBlock width="100%" height="18px" />
                    </div>
                  ))}
                </div>
                <SkeletonBlock width="100%" height="8px" borderRadius="999px" style={{ marginBottom: "1.25rem" }} />
                <SkeletonBlock width="120px" height="42px" borderRadius="10px" style={{ marginTop: "auto" }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <SkeletonBlock width="100%" height="250px" borderRadius="16px" />
            <SkeletonBlock width="100%" height="190px" borderRadius="16px" />
          </div>
        </div>
      </main>
    </SkeletonShell>
  );
}

export function SkeletonDeals({ sidebarOpen }: { sidebarOpen: boolean }) {
  const { isMobile, isTablet } = useViewport();

  return (
    <SkeletonShell sidebarOpen={sidebarOpen}>
      <main style={{ paddingTop: "5rem", minHeight: "100vh" }}>
        <div style={{ padding: isMobile ? "1rem 1rem 5.5rem" : "2rem 2.5rem", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: isTablet ? "column" : "row", gap: "2rem" }}>
          <div style={{ flex: "1 1 0", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ padding: "1.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "1.5rem" }}>
                {[0, 1, 2, 3].map((item) => (
                  <div key={item}>
                    <SkeletonBlock width="90px" height="10px" style={{ marginBottom: "0.55rem" }} />
                    <SkeletonBlock width="100%" height="26px" />
                  </div>
                ))}
              </div>
              <SkeletonBlock width="100%" height="10px" borderRadius="999px" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1.5rem" }}>
              {[0, 1].map((item) => (
                <div key={item} style={{ padding: "1.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <SkeletonBlock width="140px" height="14px" style={{ marginBottom: "1rem" }} />
                  {[0, 1, 2].map((line) => (
                    <div key={line} style={{ marginBottom: "0.85rem" }}>
                      <SkeletonBlock width="80px" height="10px" style={{ marginBottom: "0.4rem" }} />
                      <SkeletonBlock width="100%" height="16px" />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ padding: "1.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <SkeletonBlock width="150px" height="14px" style={{ marginBottom: "1.25rem" }} />
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
                {[0, 1, 2].map((item) => (
                  <div key={item} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                    <SkeletonBlock width="40px" height="40px" borderRadius="999px" />
                    <SkeletonBlock width="70px" height="12px" />
                    <SkeletonBlock width="90px" height="10px" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ width: isTablet ? "100%" : "340px", flexShrink: 0 }}>
            <div style={{ padding: "1.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <SkeletonBlock width="170px" height="26px" style={{ marginBottom: "1.5rem" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <SkeletonBlock width="100%" height="56px" borderRadius="10px" />
                <SkeletonBlock width="100%" height="56px" borderRadius="10px" />
              </div>
              <SkeletonBlock width="100%" height="58px" borderRadius="10px" style={{ marginBottom: "1rem" }} />
              <SkeletonBlock width="100%" height="82px" borderRadius="10px" style={{ marginBottom: "1rem" }} />
              <SkeletonBlock width="100%" height="48px" borderRadius="10px" />
            </div>
          </div>
        </div>
      </main>
    </SkeletonShell>
  );
}

export function SkeletonResources({ sidebarOpen }: { sidebarOpen: boolean }) {
  const { isMobile } = useViewport();

  return (
    <SkeletonShell sidebarOpen={sidebarOpen}>
      <main style={{ paddingTop: "5rem", padding: "2rem 2rem 2rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ paddingTop: "5rem" }}>
          <div style={{ marginBottom: "3rem" }}>
            <SkeletonBlock width="260px" height="42px" style={{ marginBottom: "1rem" }} />
            <SkeletonBlock width="520px" height="16px" style={{ maxWidth: "100%", marginBottom: "0.45rem" }} />
            <SkeletonBlock width="430px" height="16px" style={{ maxWidth: "92%" }} />
          </div>

          <div style={{ marginBottom: "3rem" }}>
            <SkeletonBlock width="170px" height="12px" style={{ marginBottom: "1.25rem" }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
              {[0, 1, 2].map((item) => (
                <div key={item} style={{ padding: "1.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <SkeletonBlock width="44px" height="44px" borderRadius="10px" style={{ marginBottom: "1.2rem" }} />
                  <SkeletonBlock width="180px" height="20px" style={{ marginBottom: "0.75rem" }} />
                  <SkeletonBlock width="100%" height="14px" style={{ marginBottom: "0.4rem" }} />
                  <SkeletonBlock width="78%" height="14px" />
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "3rem" }}>
            <SkeletonBlock width="200px" height="12px" style={{ marginBottom: "1.25rem" }} />
            {[0, 1, 2].map((item) => (
              <div key={item} style={{ padding: "1.25rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <SkeletonBlock width="100%" height="18px" style={{ marginBottom: "0.8rem" }} />
                <SkeletonBlock width="86%" height="14px" />
              </div>
            ))}
          </div>

          <div style={{ paddingBottom: "3rem" }}>
            <div style={{ padding: "3rem", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
              <div>
                <SkeletonBlock width="190px" height="30px" style={{ marginBottom: "0.75rem" }} />
                <SkeletonBlock width="320px" height="14px" style={{ maxWidth: "100%" }} />
              </div>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <SkeletonBlock width={isMobile ? "200px" : "180px"} height="48px" borderRadius="10px" />
                <SkeletonBlock width={isMobile ? "220px" : "190px"} height="48px" borderRadius="10px" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </SkeletonShell>
  );
}

export function SkeletonLanding() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden", padding: "0 24px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", paddingTop: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <SkeletonBlock width="44px" height="44px" borderRadius="12px" />
              <div>
                <SkeletonBlock width="120px" height="18px" style={{ marginBottom: "8px" }} />
                <SkeletonBlock width="170px" height="10px" />
              </div>
            </div>
            <SkeletonBlock width="150px" height="42px" borderRadius="999px" />
          </div>

          <div style={{ display: "flex", minHeight: "calc(100vh - 72px)", alignItems: "center", justifyContent: "center", padding: "140px 0 96px" }}>
            <div style={{ width: "100%", maxWidth: "1040px", textAlign: "center" }}>
              <SkeletonBlock width="82%" height="78px" borderRadius="16px" style={{ margin: "0 auto 18px" }} />
              <SkeletonBlock width="68%" height="78px" borderRadius="16px" style={{ margin: "0 auto 30px" }} />
              <SkeletonBlock width="72%" height="18px" style={{ margin: "0 auto 10px" }} />
              <SkeletonBlock width="56%" height="18px" style={{ margin: "0 auto 34px" }} />
              <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
                <SkeletonBlock width="180px" height="46px" borderRadius="999px" />
                <SkeletonBlock width="180px" height="46px" borderRadius="999px" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
