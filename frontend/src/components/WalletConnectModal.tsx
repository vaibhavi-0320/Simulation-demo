import React, { useState } from "react";
import { getAddress, isConnected, requestAccess } from "@stellar/freighter-api";
import { Keypair } from "stellar-sdk";
import type { WalletProvider } from "../types";
import { useViewport } from "../hooks/useViewport";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  setWalletAddress: (address: string) => void;
  onProviderConnected?: (provider: WalletProvider, address: string) => void;
}

async function connectFreighter(
  onClose: () => void,
  setWallet: (key: string) => void,
  onProviderConnected?: (provider: WalletProvider, address: string) => void,
) {
  try {
    const connected = await isConnected();
    if (!connected?.isConnected) {
      alert("Freighter is not installed. Get it at https://freighter.app");
      return;
    }

    await requestAccess();
    const { address, error } = await getAddress();
    if (error || !address) {
      throw new Error(error?.message ?? "Freighter did not return a public key.");
    }

    setWallet(address);
    onProviderConnected?.("freighter", address);
    onClose();
  } catch (err) {
    console.error("Freighter error:", err);
    alert("Freighter connection failed or was cancelled.");
  }
}

async function connectAlbedo(
  onClose: () => void,
  setWallet: (key: string) => void,
  onProviderConnected?: (provider: WalletProvider, address: string) => void,
) {
  try {
    const token = "fintrix-" + Date.now();
    const intentUrl = `https://albedo.link/intent/public_key?token=${token}&callback=postMessage`;
    const popup = window.open(intentUrl, "albedo", "width=500,height=600");

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://albedo.link") return;
      const { pubkey, error } = event.data ?? {};
      if (error) {
        alert("Albedo error: " + error);
        window.removeEventListener("message", handleMessage);
        return;
      }
      if (pubkey) {
        setWallet(pubkey);
        onProviderConnected?.("albedo", pubkey);
        window.removeEventListener("message", handleMessage);
        popup?.close();
        onClose();
      }
    };

    window.addEventListener("message", handleMessage);
  } catch (err) {
    console.error("Albedo error:", err);
    alert("Albedo connection failed. Please try again.");
  }
}

function createNewWallet() {
  window.open("https://freighter.app", "_blank");
}

function WalletCard({
  iconSrc,
  iconAlt,
  title,
  description,
  actionLabel,
  onClick,
  disabled,
}: {
  iconSrc: string;
  iconAlt: string;
  title: string;
  description: string;
  actionLabel: string;
  onClick: () => void;
  disabled: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={disabled ? undefined : onClick}
      style={{
        flex: 1,
        minWidth: "280px",
        background: "linear-gradient(180deg, rgba(18,18,18,0.98) 0%, rgba(10,10,10,0.98) 100%)",
        border: `1px solid ${hovered ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: "28px",
        padding: "2.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        transition: "all 0.2s ease",
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: hovered ? "0 0 28px rgba(59,130,246,0.18)" : "none",
        position: "relative",
        zIndex: 2,
        opacity: disabled ? 0.65 : 1,
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "18px",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <img
          src={iconSrc}
          alt={iconAlt}
          style={{
            width: "56px",
            height: "56px",
            objectFit: "contain",
            borderRadius: "12px",
          }}
        />
      </div>
      <div>
        <h3 style={{ margin: 0, color: "#fff", fontSize: "2rem", fontWeight: 600, letterSpacing: "-0.03em" }}>{title}</h3>
        <p style={{ margin: "1rem 0 0", color: "rgba(255,255,255,0.62)", fontSize: "1rem", lineHeight: 1.7 }}>{description}</p>
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        disabled={disabled}
        style={{
          marginTop: "auto",
          alignSelf: "flex-start",
          border: "none",
          background: "transparent",
          color: "#fff",
          padding: 0,
          fontSize: "1rem",
          fontWeight: 600,
          cursor: disabled ? "not-allowed" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.625rem",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <span>{actionLabel}</span>
        <span style={{ fontSize: "1.35rem", lineHeight: 1 }}>→</span>
      </button>
    </div>
  );
}

export default function WalletConnectModal({
  isOpen,
  onClose,
  setWalletAddress,
  onProviderConnected,
}: WalletConnectModalProps) {
  const [busy, setBusy] = useState<WalletProvider | null>(null);
  const { isMobile } = useViewport();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "1rem" : "2rem",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "1180px",
          borderRadius: isMobile ? "20px" : "36px",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(6,6,6,0.96)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
          overflow: "auto",
          minHeight: isMobile ? "auto" : "760px",
          maxHeight: isMobile ? "95vh" : "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            minHeight: isMobile ? "auto" : "760px",
            display: "flex",
            flexDirection: "column",
            padding: isMobile ? "1.25rem 1.25rem 1.5rem" : "2rem 2rem 2.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "1.25rem",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ color: "#fff", fontWeight: 900, fontSize: isMobile ? "1.25rem" : "2rem", letterSpacing: "-0.05em" }}>FINTRIX</div>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <span style={{ color: "rgba(255,255,255,0.42)", fontSize: isMobile ? "0.65rem" : "0.9rem", letterSpacing: "0.22em", textTransform: "uppercase", display: isMobile ? "none" : "inline" }}>
                Authentication Portal
              </span>
              <button
                type="button"
                onClick={onClose}
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "9999px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "transparent",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                }}
              >
                ?
              </button>
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "2rem 0" }}>
            <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}>
              <h2 style={{ margin: 0, color: "#fff", fontSize: isMobile ? "clamp(1.6rem, 7vw, 2.5rem)" : "4.4rem", fontWeight: 700, letterSpacing: "-0.06em", lineHeight: 1.05 }}>
                Connect Your Wallet
              </h2>
              <p style={{ margin: "1.5rem auto 0", color: "rgba(255,255,255,0.58)", fontSize: isMobile ? "0.9rem" : "1.15rem", lineHeight: 1.7, maxWidth: "780px" }}>
                Connect your Stellar wallet to start the Fintrix simulation and manage your digital assets with institutional precision.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: isMobile ? "1rem" : "2rem",
                marginTop: isMobile ? "2rem" : "4rem",
                flexWrap: "wrap",
                justifyContent: "center",
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              <WalletCard
                iconSrc="/freighter.png"
                iconAlt="Freighter"
                title="Freighter Wallet"
                description="A secure browser extension for the Stellar network that provides a non-custodial interface."
                actionLabel={busy === "freighter" ? "Connecting..." : "Click to connect"}
                disabled={busy !== null}
                onClick={async () => {
                  setBusy("freighter");
                  try {
                    await connectFreighter(onClose, setWalletAddress, onProviderConnected);
                  } finally {
                    setBusy(null);
                  }
                }}
              />
              <WalletCard
                iconSrc="/albedo.png"
                iconAlt="Albedo"
                title="Albedo Wallet"
                description="Open-source Stellar signer that allows you to interact with dApps without installing any extensions."
                actionLabel={busy === "albedo" ? "Connecting..." : "Click to connect"}
                disabled={busy !== null}
                onClick={async () => {
                  setBusy("albedo");
                  try {
                    await connectAlbedo(onClose, setWalletAddress, onProviderConnected);
                  } finally {
                    setBusy(null);
                  }
                }}
              />
            </div>

            <div style={{ marginTop: "3.5rem", textAlign: "center" }}>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.95rem", letterSpacing: "0.24em", textTransform: "uppercase" }}>
                New to Stellar?
              </div>
              <button
                type="button"
                onClick={createNewWallet}
                style={{
                  marginTop: "1.2rem",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "240px",
                  padding: "0.95rem 1.75rem",
                  borderRadius: "9999px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "transparent",
                  color: "#fff",
                  fontSize: "1rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Create a new wallet
              </button>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: isMobile ? "1rem" : "2rem",
              position: "relative",
              paddingTop: "1rem",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                border: "none",
                background: "transparent",
                color: "rgba(255,255,255,0.42)",
                cursor: "pointer",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontSize: "1rem",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Back
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                border: "none",
                background: "transparent",
                color: "rgba(255,255,255,0.82)",
                cursor: "pointer",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontSize: "1rem",
                fontFamily: "Inter, sans-serif",
                textDecoration: "underline",
                textUnderlineOffset: "8px",
              }}
            >
              Cancel
            </button>
            <div
              style={{
                position: isMobile ? "relative" : "absolute",
                right: isMobile ? "auto" : 0,
                color: "rgba(255,255,255,0.28)",
                fontSize: isMobile ? "0.75rem" : "0.95rem",
                width: isMobile ? "100%" : "auto",
                textAlign: "center",
                marginTop: isMobile ? "0.5rem" : 0,
              }}
            >
              © 2024 Fintrix
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
