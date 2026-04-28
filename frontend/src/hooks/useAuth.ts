import { useCallback, useEffect, useRef, useState } from "react";

interface AuthState {
  jwt: string | null;
  address: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Store JWT in memory only (per-tab, cleared on refresh)
let memoryJWT: string | null = null;

/**
 * Hook for wallet signature-based authentication
 * Runs the challenge/verify flow once on wallet connect
 * Stores JWT in memory (NOT localStorage)
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    jwt: null,
    address: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  const authInitializedRef = useRef(false);

  /**
   * Request a challenge nonce from the backend
   */
  const getChallenge = useCallback(async (address: string): Promise<string> => {
    const response = await fetch("/api/auth/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });

    if (!response.ok) {
      throw new Error("Failed to get challenge nonce");
    }

    const data = (await response.json()) as { nonce: string };
    return data.nonce;
  }, []);

  /**
   * Verify the signed nonce and get JWT
   */
  const verifySignature = useCallback(
    async (address: string, signature: string, nonce: string): Promise<string> => {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signature, nonce }),
      });

      if (!response.ok) {
        throw new Error("Signature verification failed");
      }

      const data = (await response.json()) as { token: string };
      return data.token;
    },
    []
  );

  /**
   * Authenticate with Freighter wallet
   */
  const authenticateWithWallet = useCallback(
    async (address: string) => {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Check if Freighter is available
        if (!(window as any).freighter) {
          throw new Error("Freighter wallet not found. Please install the Freighter extension.");
        }

        // Get challenge nonce
        const nonce = await getChallenge(address);

        // Sign with Freighter
        const signResponse = await (window as any).freighter.signMessage(
          {
            message: nonce,
          },
          { address }
        );

        // Verify signature and get JWT
        const token = await verifySignature(address, signResponse, nonce);

        // Store JWT in memory
        memoryJWT = token;

        setAuthState({
          jwt: token,
          address,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return token;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Authentication failed";
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [getChallenge, verifySignature]
  );

  /**
   * Clear authentication
   */
  const logout = useCallback(() => {
    memoryJWT = null;
    setAuthState({
      jwt: null,
      address: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  /**
   * Get the current JWT token
   */
  const getToken = useCallback(() => {
    return memoryJWT || authState.jwt;
  }, [authState.jwt]);

  /**
   * Add JWT to request headers if authenticated
   */
  const getAuthHeaders = useCallback(() => {
    const token = getToken();
    if (token) {
      return {
        Authorization: `Bearer ${token}`,
      };
    }
    return {};
  }, [getToken]);

  return {
    ...authState,
    jwt: getToken() || authState.jwt,
    authenticateWithWallet,
    logout,
    getToken,
    getAuthHeaders,
  };
}




