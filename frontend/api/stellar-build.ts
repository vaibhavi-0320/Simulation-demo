import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as StellarSdk from '@stellar/stellar-sdk';

const HORIZON = new StellarSdk.Horizon.Server(
  'https://horizon-testnet.stellar.org'
);
const PASSPHRASE = StellarSdk.Networks.TESTNET;
const ESCROW = process.env.ESCROW_DESTINATION!;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Allow CORS for Vercel preview URLs
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { investorPublicKey, amountUSD, invoiceId } = req.body || {};

  if (
    !investorPublicKey ||
    typeof investorPublicKey !== 'string' ||
    investorPublicKey.length !== 56 ||
    !investorPublicKey.startsWith('G')
  ) {
    return res.status(400).json({
      error: `Invalid public key received: "${investorPublicKey}"`,
    });
  }

  const safeAmount = Number(amountUSD);
  if (!safeAmount || safeAmount <= 0) {
    return res.status(400).json({ error: `Invalid amount: ${amountUSD}` });
  }

  if (!ESCROW || ESCROW.length !== 56) {
    return res.status(500).json({
      error: 'ESCROW_DESTINATION environment variable not configured on server.',
    });
  }

  let account: any;
  try {
    account = await HORIZON.loadAccount(investorPublicKey);
  } catch (err: any) {
    console.error("API ERROR:", err);
    if (err?.response?.status === 404) {
      return res.status(400).json({
        error:
          'Wallet not activated on testnet. Fund at: ' +
          'https://laboratory.stellar.org/#account-creator?network=test',
      });
    }
    return res.status(500).json({
      error: err.message || "Unknown error"
    });
  }

  const xlmBal = account.balances.find(
    (b: any) => b.asset_type === 'native'
  );
  const xlmNeeded = safeAmount / 0.11 + 2;
  if (!xlmBal || parseFloat(xlmBal.balance) < xlmNeeded) {
    return res.status(400).json({
      error: `Insufficient XLM. Need ${xlmNeeded.toFixed(2)}, have ${xlmBal?.balance || 0}`,
    });
  }

  try {
    await HORIZON.loadAccount(ESCROW);
  } catch (err: any) {
    console.error("API ERROR:", err);
    return res.status(500).json({
      error: err.message || "Unknown error"
    });
  }

  const xlmAmount = (safeAmount / 0.11).toFixed(7);
  const memo = `FUND:${String(invoiceId || '').substring(0, 22)}`;

  try {
    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: PASSPHRASE,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: ESCROW,
          asset: StellarSdk.Asset.native(),
          amount: xlmAmount,
        })
      )
      .addMemo(StellarSdk.Memo.text(memo))
      .setTimeout(30)
      .build();

    return res.status(200).json({
      xdr: tx.toXDR(),
      xlmAmount,
      destination: ESCROW,
    });
  } catch (err: any) {
    console.error("API ERROR:", err);
    return res.status(500).json({
      error: err.message || "Unknown error"
    });
  }
}
