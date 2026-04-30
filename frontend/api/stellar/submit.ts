import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as StellarSdk from '@stellar/stellar-sdk';

const HORIZON_TESTNET_URL = 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const horizonServer = new StellarSdk.Horizon.Server(HORIZON_TESTNET_URL);

function sanitizeAmount(value: any): number | null {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 1 || num > 1000000) return null;
  return num;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { signedXdr, amountUSD } = req.body;

    if (!signedXdr) {
      return res.status(400).json({ error: 'Missing signedXdr' });
    }

    if (amountUSD !== undefined && amountUSD !== null && !sanitizeAmount(amountUSD)) {
      return res.status(400).json({ error: 'Invalid amount. Must be between $1 and $1,000,000.' });
    }

    let txResult: any;
    try {
      const tx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
      txResult = await horizonServer.submitTransaction(tx);
    } catch (error: any) {
      const codes = error?.response?.data?.extras?.result_codes;
      const detail = error?.response?.data?.extras?.result_xdr;
      console.error('[SUBMIT] Horizon error:', JSON.stringify(codes), detail);
      return res.status(400).json({
        error: codes ? `Stellar rejected: ${JSON.stringify(codes)}` : `Submit failed: ${error.message}`,
      });
    }

    return res.status(200).json({
      success: true,
      txHash: txResult.hash,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txResult.hash}`,
    });
  } catch (error: any) {
    console.error('[SUBMIT] Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
