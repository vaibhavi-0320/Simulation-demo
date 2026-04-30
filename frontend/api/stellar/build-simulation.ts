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

function isValidPublicKey(value?: string): boolean {
  return Boolean(value && StellarSdk.StrKey.isValidEd25519PublicKey(value));
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
    const { investorPublicKey, amountUSD, invoiceId, dealId } = req.body;
    const safeAmount = sanitizeAmount(amountUSD);

    if (!isValidPublicKey(investorPublicKey)) {
      return res.status(400).json({ error: 'Invalid Stellar public key format.' });
    }

    if (!safeAmount) {
      return res.status(400).json({ error: 'Invalid amount. Must be between $1 and $1,000,000.' });
    }

    let account: any;
    try {
      account = await horizonServer.loadAccount(investorPublicKey);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return res.status(400).json({
          error: 'Wallet not activated on testnet. Fund at: https://laboratory.stellar.org/#account-creator?network=test',
        });
      }
      return res.status(400).json({ error: `Account load failed: ${error.message}` });
    }

    const xlmBal = account.balances.find((b: any) => b.asset_type === 'native');
    if (!xlmBal || parseFloat(xlmBal.balance) < 2) {
      return res.status(400).json({
        error: `Need at least 2 XLM for simulation. Current: ${xlmBal?.balance || 0} XLM`,
      });
    }

    const memoText = `SIM:${String(dealId || invoiceId).substring(0, 20)}`;

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: investorPublicKey,
          asset: StellarSdk.Asset.native(),
          amount: '1.0000000',
        })
      )
      .addMemo(StellarSdk.Memo.text(memoText))
      .setTimeout(30)
      .build();

    const xdr = tx.toXDR();

    return res.status(200).json({
      success: true,
      data: { xdr, memo: memoText },
    });
  } catch (error: any) {
    console.error('[BUILD-SIMULATION] Error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}
