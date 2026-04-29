import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as StellarSdk from '@stellar/stellar-sdk';

const HORIZON = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const PASSPHRASE = StellarSdk.Networks.TESTNET;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { investorPublicKey, invoiceId } = req.body;

  if (!investorPublicKey || investorPublicKey.length !== 56) {
    return res.status(400).json({ error: 'Invalid public key' });
  }

  let account: any;
  try {
    account = await HORIZON.loadAccount(investorPublicKey);
  } catch (e: any) {
    if (e?.response?.status === 404) {
      return res.status(400).json({
        error: 'Wallet not activated on testnet. Fund at Friendbot.'
      });
    }
    return res.status(400).json({ error: `Account load failed: ${e.message}` });
  }

  const xlmBal = account.balances.find((b: any) => b.asset_type === 'native');
  if (!xlmBal || parseFloat(xlmBal.balance) < 2) {
    return res.status(400).json({
      error: `Need at least 2 XLM for simulation. Have: ${xlmBal?.balance || 0}`
    });
  }

  const memoText = `SIM:${String(invoiceId || 'demo').substring(0, 20)}`;

  try {
    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: PASSPHRASE,
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: investorPublicKey, // self-payment
        asset: StellarSdk.Asset.native(),
        amount: '1.0000000',
      }))
      .addMemo(StellarSdk.Memo.text(memoText))
      .setTimeout(30)
      .build();

    return res.status(200).json({ xdr: tx.toXDR(), memo: memoText });
  } catch (e: any) {
    return res.status(500).json({ error: `Build failed: ${e.message}` });
  }
}
