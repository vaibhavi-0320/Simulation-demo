import { useState, useEffect } from "react";
export function useWallet() {
    const [status, setStatus] = useState({
        state: "disconnected",
        address: null,
        error: null,
    });
    // Check if Freighter is available
    const isFreighterAvailable = () => {
        return typeof window !== "undefined" && window.freighter;
    };
    // Connect wallet
    const connect = async () => {
        if (!isFreighterAvailable()) {
            setStatus({
                state: "error",
                address: null,
                error: "Freighter wallet not found. Please install the Freighter extension.",
            });
            return;
        }
        setStatus((prev) => ({ ...prev, state: "connecting", error: null }));
        try {
            const publicKey = await window.freighter.getPublicKey();
            setStatus({
                state: "connected",
                address: publicKey,
                error: null,
            });
        }
        catch (error) {
            setStatus({
                state: "error",
                address: null,
                error: error instanceof Error ? error.message : "Failed to connect wallet",
            });
        }
    };
    // Sign message
    const signMessage = async (message) => {
        if (status.state !== "connected" || !status.address) {
            throw new Error("Wallet not connected");
        }
        setStatus((prev) => ({ ...prev, state: "signing" }));
        try {
            const signature = await window.freighter.signMessage({ message }, { address: status.address });
            setStatus((prev) => ({ ...prev, state: "connected" }));
            return signature;
        }
        catch (error) {
            setStatus((prev) => ({
                ...prev,
                state: "error",
                error: error instanceof Error ? error.message : "Failed to sign message",
            }));
            throw error;
        }
    };
    // Disconnect wallet
    const disconnect = () => {
        setStatus({
            state: "disconnected",
            address: null,
            error: null,
        });
    };
    // Handle wallet disconnect events
    useEffect(() => {
        const handleDisconnect = () => {
            if (status.state !== "disconnected") {
                disconnect();
            }
        };
        // Listen for wallet disconnect events (if supported by Freighter)
        if (window.freighter && window.freighter.onDisconnect) {
            window.freighter.onDisconnect(handleDisconnect);
        }
        return () => {
            if (window.freighter && window.freighter.offDisconnect) {
                window.freighter.offDisconnect(handleDisconnect);
            }
        };
    }, [status.state]);
    return {
        ...status,
        connect,
        signMessage,
        disconnect,
        isFreighterAvailable: isFreighterAvailable(),
    };
}
