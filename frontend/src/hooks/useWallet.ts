import { useState, useEffect } from "react";

type WalletState = "disconnected" | "connecting" | "connected" | "signing" | "error";

interface WalletStatus {
  state: WalletState;
  address: string | null;
  error: string | null;
}

export function useWallet() {
  const [status, setStatus] = useState<WalletStatus>({
    state: "disconnected",
    address: null,
    error: null,
  });

  // Check if Freighter is available
  const isFreighterAvailable = () => {
    return typeof window !== "undefined" && (window as any).freighter;
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
      const publicKey = await (window as any).freighter.getPublicKey();
      setStatus({
        state: "connected",
        address: publicKey,
        error: null,
      });
    } catch (error) {
      setStatus({
        state: "error",
        address: null,
        error: error instanceof Error ? error.message : "Failed to connect wallet",
      });
    }
  };

  // Sign message
  const signMessage = async (message: string) => {
    if (status.state !== "connected" || !status.address) {
      throw new Error("Wallet not connected");
    }

    setStatus((prev) => ({ ...prev, state: "signing" }));

    try {
      const signature = await (window as any).freighter.signMessage({ message }, { address: status.address });
      setStatus((prev) => ({ ...prev, state: "connected" }));
      return signature;
    } catch (error) {
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
    if ((window as any).freighter && (window as any).freighter.onDisconnect) {
      (window as any).freighter.onDisconnect(handleDisconnect);
    }

    return () => {
      if ((window as any).freighter && (window as any).freighter.offDisconnect) {
        (window as any).freighter.offDisconnect(handleDisconnect);
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




