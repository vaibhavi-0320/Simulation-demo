import React, { useState } from "react";
import { getAddress, isConnected, requestAccess } from "@stellar/freighter-api";
import { useViewport } from "../hooks/useViewport";

interface WalletSelectorProps {
  onConnect: (provider: "freighter" | "albedo", publicKey?: string) => Promise<void>;
  onClose: () => void;
}

export default function WalletSelector({ onConnect, onClose }: WalletSelectorProps) {
  const [busy, setBusy] = useState<"freighter" | "albedo" | null>(null);
  const [albedoKey, setAlbedoKey] = useState("");
  const [showAlbedoInput, setShowAlbedoInput] = useState(false);
  const [error, setError] = useState("");
  const { isMobile } = useViewport();

  const handleFreighter = async () => {
    setBusy("freighter");
    setError("");
    try {
      // quick presence check for Freighter extension
      try {
        const status = await isConnected();
        if (!status || !status.isConnected) {
          alert("Freighter extension is not installed. Please install it from https://freighter.app");
          setBusy(null);
          return;
        }
      } catch (_) {
        // if the check itself fails, continue and let the service handle the error
      }

      await requestAccess();
      const { address, error } = await getAddress();
      if (error || !address) {
        throw new Error(error?.message ?? "No public key returned from Freighter.");
      }
      await onConnect("freighter", address);
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      if (msg.toLowerCase().includes("cancel") || msg.toLowerCase().includes("reject") || msg.toLowerCase().includes("decli")) {
        alert("Connection cancelled by user.");
      } else {
        alert("Failed to connect Freighter wallet. Please try again.");
      }
      setError(e?.message ?? "Failed to connect Freighter. Make sure the extension is installed.");
    } finally {
      setBusy(null);
    }
  };

  const handleAlbedo = async () => {
    setError("");
    if (!showAlbedoInput) {
      try {
        setBusy("albedo");
        const intentUrl = `https://albedo.link/intent/public_key?token=fintrix-${Date.now()}&callback=postMessage`;
        const popup = window.open(intentUrl, "albedo", "width=500,height=600");

        if (!popup) {
          throw new Error("Popup blocked");
        }

        await new Promise<void>((resolve, reject) => {
          let settled = false;

          const cleanup = () => {
            window.removeEventListener("message", handleMessage);
            clearInterval(popupCheck);
            if (!popup.closed) {
              popup.close();
            }
            setBusy(null);
          };

          const handleMessage = async (event: MessageEvent) => {
            if (event.origin !== "https://albedo.link" || settled) return;

            const { pubkey, error } = (event.data ?? {}) as { pubkey?: string; error?: string };

            if (error) {
              settled = true;
              cleanup();
              alert("Albedo connection failed: " + error);
              reject(new Error(error));
              return;
            }

            if (pubkey) {
              settled = true;
              cleanup();
              try {
                await onConnect("albedo", pubkey);
                resolve();
              } catch (connectError) {
                reject(connectError);
              }
            }
          };

          const popupCheck = window.setInterval(() => {
            if (!popup.closed || settled) return;
            settled = true;
            cleanup();
            reject(new Error("Connection cancelled by user."));
          }, 500);

          window.addEventListener("message", handleMessage);
        });

        return;
      } catch (err: any) {
        const errStr = String(err || "").toLowerCase();
        if (errStr.includes("cancel") || errStr.includes("user")) {
          alert("Connection cancelled by user.");
        } else {
          console.error("Albedo connection error:", err);
          alert("Failed to connect Albedo. Please try again.");
        }
        setBusy(null);
        return;
      }
    }

    if (!albedoKey.trim()) {
      setError("Please paste your Albedo public key.");
      return;
    }

    setBusy("albedo");
    setError("");
    try {
      await onConnect("albedo", albedoKey.trim());
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      if (msg.toLowerCase().includes("cancel") || msg.toLowerCase().includes("reject")) {
        alert("Connection cancelled by user.");
      } else {
        alert("Failed to connect Albedo wallet. Please try again.");
      }
      setError(e?.message ?? "Failed to connect Albedo.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#000",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* Globe background overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          backgroundImage: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,102,255,0.08), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Decorative soft blue orb centered behind the panel */}
      <div style={{ position: "fixed", left: "50%", top: "45%", transform: "translate(-50%, -50%)", width: "680px", height: "680px", borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, rgba(59,130,246,0.18), rgba(59,130,246,0.08) 30%, transparent 60%)", filter: "blur(48px)", zIndex: 1, pointerEvents: "none" }} />

      {/* Top gradient fade */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "linear-gradient(to bottom, #000 0%, transparent 30%, transparent 70%, #000 100%)", pointerEvents: "none" }} />

      {/* Decorative top edge */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)", zIndex: 60 }} />

      {/* Top Nav */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 50,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 0 20px rgba(255,255,255,0.03)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 1.5rem",
        }}
      >
        <div style={{ fontSize: "1.25rem", fontWeight: 900, letterSpacing: "-0.04em", textTransform: "uppercase" }}>Fintrix</div>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Authentication Portal
          </span>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.7)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "1.2rem", fontWeight: 700 }}>✕</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "6rem 1.5rem 8rem",
        }}
      >
        {/* Header */}
        <div style={{ maxWidth: "900px", width: "100%", textAlign: "center", marginBottom: "3rem" }}>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 600,
              color: "#fff",
              letterSpacing: "-0.04em",
              marginBottom: "1rem",
              lineHeight: 1.1,
            }}
          >
            Connect Your Wallet
          </h1>
          <p style={{ fontSize: "1.125rem", color: "rgba(255,255,255,0.6)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>
            Connect your Stellar wallet to start the Fintrix simulation and manage your digital assets with institutional precision.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ maxWidth: "900px", width: "100%", marginBottom: "1.5rem", padding: "0.75rem 1rem", background: "rgba(255,0,0,0.08)", border: "1px solid rgba(255,0,0,0.2)", borderRadius: "0.5rem", color: "#ff6b6b", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}

        {/* Wallet Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", maxWidth: "900px", width: "100%" }}>
          {/* Freighter */}
          <button
            onClick={handleFreighter}
            disabled={busy !== null}
            style={{
              background: "linear-gradient(145deg, #0a0a0a, #111)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              borderRadius: "20px",
              padding: "2rem",
              textAlign: "left",
              cursor: busy !== null ? "not-allowed" : "pointer",
              opacity: busy === "albedo" ? 0.5 : 1,
              transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              fontFamily: "Inter, sans-serif",
            }}
            onMouseEnter={(e) => {
              if (busy === null) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.4)";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 30px rgba(255,255,255,0.05)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
          >
            <div style={{ marginBottom: "2rem", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.05)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
              <img src="/freighter.png" alt="Freighter Wallet" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#fff", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>Freighter Wallet</h3>
            <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.6)", marginBottom: "3rem", lineHeight: 1.6 }}>
              A secure browser extension for the Stellar network that provides a non-custodial interface.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#fff", fontWeight: 600 }}>
              <span>{busy === "freighter" ? "Connecting..." : "Click to connect"}</span>
              <span style={{ fontSize: "1.25rem" }}>→</span>
            </div>
          </button>

          {/* Albedo */}
          <div
            style={{
              background: "linear-gradient(145deg, #0a0a0a, #111)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              borderRadius: "20px",
              padding: "2rem",
              textAlign: "left",
              opacity: busy === "freighter" ? 0.5 : 1,
              transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
            onMouseEnter={(e) => {
              if (busy === null) {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.4)";
                (e.currentTarget as HTMLDivElement).style.transform = "scale(1.02)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 30px rgba(255,255,255,0.05)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.1)";
              (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
          >
            <div style={{ marginBottom: "2rem", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.05)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
              <img src="/albedo.png" alt="Albedo Wallet" style={{ width: "100%", height: "100%", objectFit: "contain", background: "#fff" }} />
            </div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#fff", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>Albedo Wallet</h3>
            <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.6)", marginBottom: "3rem", lineHeight: 1.6 }}>
              Open-source Stellar signer that allows you to interact with dApps without installing any extensions.
            </p>

            {!showAlbedoInput ? (
              <button
                onClick={handleAlbedo}
                disabled={busy !== null}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#fff", fontWeight: 600, background: "transparent", border: "none", cursor: busy !== null ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif", fontSize: "0.9375rem" }}
              >
                <span>Click to connect</span>
                <span style={{ fontSize: "1.25rem" }}>→</span>
              </button>
            ) : (
              <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                <input
                  autoFocus
                  value={albedoKey}
                  onChange={(e) => setAlbedoKey(e.target.value)}
                  placeholder="Paste Albedo public key..."
                  style={{ flex: 1, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9999px", padding: "0.625rem 1rem", fontSize: "12px", color: "#fff", outline: "none", fontFamily: "monospace" }}
                  onKeyDown={(e) => e.key === "Enter" && handleAlbedo()}
                />
                <button
                  onClick={handleAlbedo}
                  disabled={busy !== null}
                  style={{ background: "#fff", color: "#000", border: "none", borderRadius: "9999px", padding: "0.625rem 1rem", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "Inter, sans-serif" }}
                >
                  {busy === "albedo" ? "..." : "GO"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* New to Stellar */}
        <div style={{ marginTop: "3rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>New to Stellar?</p>
          <a
            href="https://stellar.org/learn/intro-to-stellar"
            target="_blank"
            rel="noreferrer"
            style={{ padding: "0.5rem 1.5rem", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9999px", color: "#fff", fontSize: "0.875rem", fontWeight: 500, textDecoration: "none", transition: "background 0.2s" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "transparent")}
          >
            Learn about Stellar wallets
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          position: isMobile ? "relative" : "fixed",
          bottom: isMobile ? "auto" : 0,
          width: "100%",
          zIndex: 50,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "center",
          alignItems: "center",
          gap: isMobile ? "0.75rem" : "2rem",
          paddingBottom: isMobile ? "1.5rem" : "2rem",
          paddingTop: isMobile ? "1rem" : 0,
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        <div style={{ display: "flex", gap: "2rem" }}>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.3)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Back</button>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.3)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", textDecoration: "underline", textUnderlineOffset: "4px" }}>Cancel</button>
        </div>
        <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", fontFamily: "monospace" }}>© 2026 Fintrix</div>
      </footer>
    </div>
  );
}
