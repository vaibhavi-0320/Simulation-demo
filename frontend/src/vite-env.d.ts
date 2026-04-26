/// <reference types="vite/client" />

interface AlbedoWallet {
  publicKey(): Promise<{ pubkey: string }>;
  signMessage(message: string): Promise<{ signature: string }>;
  signTransaction(transaction: string): Promise<{ signedTxXdr: string }>;
}

declare global {
  interface Window {
    freighter: any;
    albedo?: AlbedoWallet;
  }
}

export {};
