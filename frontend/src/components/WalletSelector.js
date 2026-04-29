import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import { getAddress, isConnected, requestAccess } from "@stellar/freighter-api";
import { useViewport } from "../hooks/useViewport";
export default function WalletSelector({ onConnect, onClose }) {
    const [busy, setBusy] = useState(null);
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
            }
            catch (_) {
                // if the check itself fails, continue and let the service handle the error
            }
            await requestAccess();
            const { address, error } = await getAddress();
            if (error || !address) {
                throw new Error(error?.message ?? "No public key returned from Freighter.");
            }
            await onConnect("freighter", address);
        }
        catch (e) {
            const msg = e?.message ?? String(e);
            if (msg.toLowerCase().includes("cancel") || msg.toLowerCase().includes("reject") || msg.toLowerCase().includes("decli")) {
                alert("Connection cancelled by user.");
            }
            else {
                alert("Failed to connect Freighter wallet. Please try again.");
            }
            setError(e?.message ?? "Failed to connect Freighter. Make sure the extension is installed.");
        }
        finally {
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
                await new Promise((resolve, reject) => {
                    let settled = false;
                    const cleanup = () => {
                        window.removeEventListener("message", handleMessage);
                        clearInterval(popupCheck);
                        if (!popup.closed) {
                            popup.close();
                        }
                        setBusy(null);
                    };
                    const handleMessage = async (event) => {
                        if (event.origin !== "https://albedo.link" || settled)
                            return;
                        const { pubkey, error } = (event.data ?? {});
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
                            }
                            catch (connectError) {
                                reject(connectError);
                            }
                        }
                    };
                    const popupCheck = window.setInterval(() => {
                        if (!popup.closed || settled)
                            return;
                        settled = true;
                        cleanup();
                        reject(new Error("Connection cancelled by user."));
                    }, 500);
                    window.addEventListener("message", handleMessage);
                });
                return;
            }
            catch (err) {
                const errStr = String(err || "").toLowerCase();
                if (errStr.includes("cancel") || errStr.includes("user")) {
                    alert("Connection cancelled by user.");
                }
                else {
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
        }
        catch (e) {
            const msg = e?.message ?? String(e);
            if (msg.toLowerCase().includes("cancel") || msg.toLowerCase().includes("reject")) {
                alert("Connection cancelled by user.");
            }
            else {
                alert("Failed to connect Albedo wallet. Please try again.");
            }
            setError(e?.message ?? "Failed to connect Albedo.");
        }
        finally {
            setBusy(null);
        }
    };
    return (_jsxs("div", { style: {
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "#000",
            color: "#fff",
            fontFamily: "Inter, sans-serif",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
        }, children: [_jsx("div", { style: {
                    position: "fixed",
                    inset: 0,
                    zIndex: 0,
                    backgroundImage: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,102,255,0.08), transparent 70%)",
                    pointerEvents: "none",
                } }), _jsx("div", { style: { position: "fixed", left: "50%", top: "45%", transform: "translate(-50%, -50%)", width: "680px", height: "680px", borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, rgba(59,130,246,0.18), rgba(59,130,246,0.08) 30%, transparent 60%)", filter: "blur(48px)", zIndex: 1, pointerEvents: "none" } }), _jsx("div", { style: { position: "fixed", inset: 0, zIndex: 0, background: "linear-gradient(to bottom, #000 0%, transparent 30%, transparent 70%, #000 100%)", pointerEvents: "none" } }), _jsx("div", { style: { position: "fixed", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)", zIndex: 60 } }), _jsxs("nav", { style: {
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
                }, children: [_jsx("div", { style: { fontSize: "1.25rem", fontWeight: 900, letterSpacing: "-0.04em", textTransform: "uppercase" }, children: "Fintrix" }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: "1.5rem" }, children: [_jsx("span", { style: { color: "rgba(255,255,255,0.4)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }, children: "Authentication Portal" }), _jsx("button", { onClick: onClose, style: { width: "32px", height: "32px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.7)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }, children: _jsx("span", { style: { fontSize: "1.2rem", fontWeight: 700 }, children: "\u2715" }) })] })] }), _jsxs("main", { style: {
                    position: "relative",
                    zIndex: 10,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                    padding: "6rem 1.5rem 8rem",
                }, children: [_jsxs("div", { style: { maxWidth: "900px", width: "100%", textAlign: "center", marginBottom: "3rem" }, children: [_jsx("h1", { style: {
                                    fontSize: "clamp(2rem, 5vw, 3rem)",
                                    fontWeight: 600,
                                    color: "#fff",
                                    letterSpacing: "-0.04em",
                                    marginBottom: "1rem",
                                    lineHeight: 1.1,
                                }, children: "Connect Your Wallet" }), _jsx("p", { style: { fontSize: "1.125rem", color: "rgba(255,255,255,0.6)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }, children: "Connect your Stellar wallet to start the Fintrix simulation and manage your digital assets with institutional precision." })] }), error && (_jsx("div", { style: { maxWidth: "900px", width: "100%", marginBottom: "1.5rem", padding: "0.75rem 1rem", background: "rgba(255,0,0,0.08)", border: "1px solid rgba(255,0,0,0.2)", borderRadius: "0.5rem", color: "#ff6b6b", fontSize: "0.875rem" }, children: error })), _jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", maxWidth: "900px", width: "100%" }, children: [_jsxs("button", { onClick: handleFreighter, disabled: busy !== null, style: {
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
                                }, onMouseEnter: (e) => {
                                    if (busy === null) {
                                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
                                        e.currentTarget.style.transform = "scale(1.02)";
                                        e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.05)";
                                    }
                                }, onMouseLeave: (e) => {
                                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                                    e.currentTarget.style.transform = "scale(1)";
                                    e.currentTarget.style.boxShadow = "none";
                                }, children: [_jsx("div", { style: { marginBottom: "2rem", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.05)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }, children: _jsx("img", { src: "/freighter.png", alt: "Freighter Wallet", style: { width: "100%", height: "100%", objectFit: "cover" } }) }), _jsx("h3", { style: { fontSize: "1.5rem", fontWeight: 600, color: "#fff", marginBottom: "0.5rem", letterSpacing: "-0.02em" }, children: "Freighter Wallet" }), _jsx("p", { style: { fontSize: "0.9375rem", color: "rgba(255,255,255,0.6)", marginBottom: "3rem", lineHeight: 1.6 }, children: "A secure browser extension for the Stellar network that provides a non-custodial interface." }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem", color: "#fff", fontWeight: 600 }, children: [_jsx("span", { children: busy === "freighter" ? "Connecting..." : "Click to connect" }), _jsx("span", { style: { fontSize: "1.25rem" }, children: "\u2192" })] })] }), _jsxs("div", { style: {
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
                                }, onMouseEnter: (e) => {
                                    if (busy === null) {
                                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
                                        e.currentTarget.style.transform = "scale(1.02)";
                                        e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.05)";
                                    }
                                }, onMouseLeave: (e) => {
                                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                                    e.currentTarget.style.transform = "scale(1)";
                                    e.currentTarget.style.boxShadow = "none";
                                }, children: [_jsx("div", { style: { marginBottom: "2rem", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.05)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }, children: _jsx("img", { src: "/albedo.png", alt: "Albedo Wallet", style: { width: "100%", height: "100%", objectFit: "contain", background: "#fff" } }) }), _jsx("h3", { style: { fontSize: "1.5rem", fontWeight: 600, color: "#fff", marginBottom: "0.5rem", letterSpacing: "-0.02em" }, children: "Albedo Wallet" }), _jsx("p", { style: { fontSize: "0.9375rem", color: "rgba(255,255,255,0.6)", marginBottom: "3rem", lineHeight: 1.6 }, children: "Open-source Stellar signer that allows you to interact with dApps without installing any extensions." }), !showAlbedoInput ? (_jsxs("button", { onClick: handleAlbedo, disabled: busy !== null, style: { display: "flex", alignItems: "center", gap: "0.5rem", color: "#fff", fontWeight: 600, background: "transparent", border: "none", cursor: busy !== null ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif", fontSize: "0.9375rem" }, children: [_jsx("span", { children: "Click to connect" }), _jsx("span", { style: { fontSize: "1.25rem" }, children: "\u2192" })] })) : (_jsxs("div", { style: { display: "flex", gap: "0.5rem", width: "100%" }, children: [_jsx("input", { autoFocus: true, value: albedoKey, onChange: (e) => setAlbedoKey(e.target.value), placeholder: "Paste Albedo public key...", style: { flex: 1, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9999px", padding: "0.625rem 1rem", fontSize: "12px", color: "#fff", outline: "none", fontFamily: "monospace" }, onKeyDown: (e) => e.key === "Enter" && handleAlbedo() }), _jsx("button", { onClick: handleAlbedo, disabled: busy !== null, style: { background: "#fff", color: "#000", border: "none", borderRadius: "9999px", padding: "0.625rem 1rem", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "Inter, sans-serif" }, children: busy === "albedo" ? "..." : "GO" })] }))] })] }), _jsxs("div", { style: { marginTop: "3rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }, children: [_jsx("p", { style: { color: "rgba(255,255,255,0.3)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }, children: "New to Stellar?" }), _jsx("a", { href: "https://stellar.org/learn/intro-to-stellar", target: "_blank", rel: "noreferrer", style: { padding: "0.5rem 1.5rem", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9999px", color: "#fff", fontSize: "0.875rem", fontWeight: 500, textDecoration: "none", transition: "background 0.2s" }, onMouseEnter: (e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)"), onMouseLeave: (e) => (e.currentTarget.style.background = "transparent"), children: "Learn about Stellar wallets" })] })] }), _jsxs("footer", { style: {
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
                }, children: [_jsxs("div", { style: { display: "flex", gap: "2rem" }, children: [_jsx("button", { onClick: onClose, style: { color: "rgba(255,255,255,0.3)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em" }, children: "Back" }), _jsx("button", { onClick: onClose, style: { color: "rgba(255,255,255,0.3)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", textDecoration: "underline", textUnderlineOffset: "4px" }, children: "Cancel" })] }), _jsx("div", { style: { color: "rgba(255,255,255,0.2)", fontSize: "12px", fontFamily: "monospace" }, children: "\u00A9 2026 Fintrix" })] })] }));
}
