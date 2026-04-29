import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as StellarSdk from '@stellar/stellar-sdk';

const HORIZON = new StellarSdk.Horizon.Server(
  'https://horizon-testnet.stellar.org'
);
const PASSPHRASE = StellarSdk.Networks.TESTNET;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { signedXdr } = req.body || {};

  if (!signedXdr || typeof signedXdr !== 'string' || signedXdr.length < 50) {
    return res.status(400).json({
      error: `Invalid or empty signedXdr received. Length: ${signedXdr?.length || 0}`,
    });
  }

  try {
    const tx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, PASSPHRASE);
    const result = await HORIZON.submitTransaction(tx);
    return res.status(200).json({
      success: true,
      txHash: result.hash,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${result.hash}`,
    });
  } catch (e: any) {
    const codes = e?.response?.data?.extras?.result_codes;
    return res.status(400).json({
      error: codes
        ? `Stellar rejected: ${JSON.stringify(codes)}`
        : `Submit failed: ${e.message}`,
    });
  }
}
