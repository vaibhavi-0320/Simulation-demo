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
    const { investorPublicKey, amountUSD, invoiceId } = req.body;
    const safeAmount = sanitizeAmount(amountUSD);

    if (!isValidPublicKey(investorPublicKey)) {
      return res.status(400).json({ error: 'Invalid Stellar public key format.' });
    }

    if (!safeAmount) {
      return res.status(400).json({ error: 'Invalid amount. Must be between $1 and $1,000,000.' });
    }

    if (!invoiceId) {
      return res.status(400).json({ error: 'Missing invoiceId' });
    }

    let account: any;
    try {
      account = await horizonServer.loadAccount(investorPublicKey);
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 404) {
        return res.status(400).json({
          error: `Your wallet is not activated on Stellar testnet. Visit https://laboratory.stellar.org/#account-creator?network=test and fund: ${investorPublicKey}`,
        });
      }
      return res.status(400).json({ error: `Horizon loadAccount failed: ${error.message}` });
    }

    const xlmBal = account.balances.find((b: any) => b.asset_type === 'native');
    const xlmNeeded = safeAmount / 0.11 + 2;

    if (!xlmBal || parseFloat(xlmBal.balance) < xlmNeeded) {
      return res.status(400).json({
        error: `Insufficient XLM. Need ${xlmNeeded.toFixed(2)} XLM, have ${xlmBal?.balance || 0} XLM. Fund at Friendbot.`,
      });
    }

    const xlmAmount = (safeAmount / 0.11).toFixed(7);
    const memo = `INV:${String(invoiceId).substring(0, 22)}`;

    try {
      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: process.env.ESCROW_DESTINATION || 'GBUWCRHTSXJ5WCERNSIKUFVTZ35M542OID4FRZI2TFNKEVVHSPY7PT5Z',
            asset: StellarSdk.Asset.native(),
            amount: xlmAmount,
          })
        )
        .addMemo(StellarSdk.Memo.text(memo))
        .setTimeout(30)
        .build();

      const xdr = tx.toXDR();
      return res.status(200).json({ xdr, xlmAmount, destination: process.env.ESCROW_DESTINATION });
    } catch (error: any) {
      console.error('[BUILD] TransactionBuilder error:', error);
      return res.status(500).json({ error: `Failed to build XDR: ${error.message}` });
    }
  } catch (error: any) {
    console.error('[BUILD] Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
