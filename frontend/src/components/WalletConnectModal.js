import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import { getAddress, isConnected, requestAccess } from "@stellar/freighter-api";
import { useViewport } from "../hooks/useViewport";
async function connectFreighter(onClose, setWallet, onProviderConnected) {
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
    }
    catch (err) {
        console.error("Freighter error:", err);
        alert("Freighter connection failed or was cancelled.");
    }
}
async function connectAlbedo(onClose, setWallet, onProviderConnected) {
    try {
        const token = "fintrix-" + Date.now();
        const intentUrl = `https://albedo.link/intent/public_key?token=${token}&callback=postMessage`;
        const popup = window.open(intentUrl, "albedo", "width=500,height=600");
        const handleMessage = (event) => {
            if (event.origin !== "https://albedo.link")
                return;
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
    }
    catch (err) {
        console.error("Albedo error:", err);
        alert("Albedo connection failed. Please try again.");
    }
}
function createNewWallet() {
    window.open("https://freighter.app", "_blank");
}
function WalletCard({ iconSrc, iconAlt, title, description, actionLabel, onClick, disabled, }) {
    const [hovered, setHovered] = useState(false);
    return (_jsxs("div", { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false), onClick: disabled ? undefined : onClick, style: {
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
        }, children: [_jsx("div", { style: {
                    width: "64px",
                    height: "64px",
                    borderRadius: "18px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                }, children: _jsx("img", { src: iconSrc, alt: iconAlt, style: {
                        width: "56px",
                        height: "56px",
                        objectFit: "contain",
                        borderRadius: "12px",
                    } }) }), _jsxs("div", { children: [_jsx("h3", { style: { margin: 0, color: "#fff", fontSize: "2rem", fontWeight: 600, letterSpacing: "-0.03em" }, children: title }), _jsx("p", { style: { margin: "1rem 0 0", color: "rgba(255,255,255,0.62)", fontSize: "1rem", lineHeight: 1.7 }, children: description })] }), _jsxs("button", { type: "button", onClick: (event) => {
                    event.stopPropagation();
                    onClick();
                }, disabled: disabled, style: {
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
                }, children: [_jsx("span", { children: actionLabel }), _jsx("span", { style: { fontSize: "1.35rem", lineHeight: 1 }, children: "\u2192" })] })] }));
}
export default function WalletConnectModal({ isOpen, onClose, setWalletAddress, onProviderConnected, }) {
    const [busy, setBusy] = useState(null);
    const { isMobile } = useViewport();
    if (!isOpen)
        return null;
    return (_jsx("div", { style: {
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: isMobile ? "1rem" : "2rem",
        }, children: _jsxs("div", { style: {
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
            }, children: [_jsx("div", { style: {
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
                    } }), _jsxs("div", { style: {
                        position: "relative",
                        zIndex: 1,
                        minHeight: isMobile ? "auto" : "760px",
                        display: "flex",
                        flexDirection: "column",
                        padding: isMobile ? "1.25rem 1.25rem 1.5rem" : "2rem 2rem 2.5rem",
                    }, children: [_jsxs("div", { style: {
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                paddingBottom: "1.25rem",
                                borderBottom: "1px solid rgba(255,255,255,0.08)",
                            }, children: [_jsx("div", { style: { color: "#fff", fontWeight: 900, fontSize: isMobile ? "1.25rem" : "2rem", letterSpacing: "-0.05em" }, children: "FINTRIX" }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: "1.5rem" }, children: [_jsx("span", { style: { color: "rgba(255,255,255,0.42)", fontSize: isMobile ? "0.65rem" : "0.9rem", letterSpacing: "0.22em", textTransform: "uppercase", display: isMobile ? "none" : "inline" }, children: "Authentication Portal" }), _jsx("button", { type: "button", onClick: onClose, style: {
                                                width: "42px",
                                                height: "42px",
                                                borderRadius: "9999px",
                                                border: "1px solid rgba(255,255,255,0.12)",
                                                background: "transparent",
                                                color: "#fff",
                                                cursor: "pointer",
                                                fontSize: "1.1rem",
                                            }, children: "?" })] })] }), _jsxs("div", { style: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "2rem 0" }, children: [_jsxs("div", { style: { maxWidth: "760px", margin: "0 auto", textAlign: "center" }, children: [_jsx("h2", { style: { margin: 0, color: "#fff", fontSize: isMobile ? "clamp(1.6rem, 7vw, 2.5rem)" : "4.4rem", fontWeight: 700, letterSpacing: "-0.06em", lineHeight: 1.05 }, children: "Connect Your Wallet" }), _jsx("p", { style: { margin: "1.5rem auto 0", color: "rgba(255,255,255,0.58)", fontSize: isMobile ? "0.9rem" : "1.15rem", lineHeight: 1.7, maxWidth: "780px" }, children: "Connect your Stellar wallet to start the Fintrix simulation and manage your digital assets with institutional precision." })] }), _jsxs("div", { style: {
                                        display: "flex",
                                        gap: isMobile ? "1rem" : "2rem",
                                        marginTop: isMobile ? "2rem" : "4rem",
                                        flexWrap: "wrap",
                                        justifyContent: "center",
                                        flexDirection: isMobile ? "column" : "row",
                                    }, children: [_jsx(WalletCard, { iconSrc: "/freighter.png", iconAlt: "Freighter", title: "Freighter Wallet", description: "A secure browser extension for the Stellar network that provides a non-custodial interface.", actionLabel: busy === "freighter" ? "Connecting..." : "Click to connect", disabled: busy !== null, onClick: async () => {
                                                setBusy("freighter");
                                                try {
                                                    await connectFreighter(onClose, setWalletAddress, onProviderConnected);
                                                }
                                                finally {
                                                    setBusy(null);
                                                }
                                            } }), _jsx(WalletCard, { iconSrc: "/albedo.png", iconAlt: "Albedo", title: "Albedo Wallet", description: "Open-source Stellar signer that allows you to interact with dApps without installing any extensions.", actionLabel: busy === "albedo" ? "Connecting..." : "Click to connect", disabled: busy !== null, onClick: async () => {
                                                setBusy("albedo");
                                                try {
                                                    await connectAlbedo(onClose, setWalletAddress, onProviderConnected);
                                                }
                                                finally {
                                                    setBusy(null);
                                                }
                                            } })] }), _jsxs("div", { style: { marginTop: "3.5rem", textAlign: "center" }, children: [_jsx("div", { style: { color: "rgba(255,255,255,0.35)", fontSize: "0.95rem", letterSpacing: "0.24em", textTransform: "uppercase" }, children: "New to Stellar?" }), _jsx("button", { type: "button", onClick: createNewWallet, style: {
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
                                            }, children: "Create a new wallet" })] })] }), _jsxs("div", { style: {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: isMobile ? "1rem" : "2rem",
                                position: "relative",
                                paddingTop: "1rem",
                                flexWrap: "wrap",
                            }, children: [_jsx("button", { type: "button", onClick: onClose, style: {
                                        border: "none",
                                        background: "transparent",
                                        color: "rgba(255,255,255,0.42)",
                                        cursor: "pointer",
                                        letterSpacing: "0.2em",
                                        textTransform: "uppercase",
                                        fontSize: "1rem",
                                        fontFamily: "Inter, sans-serif",
                                    }, children: "Back" }), _jsx("button", { type: "button", onClick: onClose, style: {
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
                                    }, children: "Cancel" }), _jsx("div", { style: {
                                        position: isMobile ? "relative" : "absolute",
                                        right: isMobile ? "auto" : 0,
                                        color: "rgba(255,255,255,0.28)",
                                        fontSize: isMobile ? "0.75rem" : "0.95rem",
                                        width: isMobile ? "100%" : "auto",
                                        textAlign: "center",
                                        marginTop: isMobile ? "0.5rem" : 0,
                                    }, children: "\u00A9 2024 Fintrix" })] })] })] }) }));
}
