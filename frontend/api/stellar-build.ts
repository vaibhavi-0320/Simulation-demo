import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as StellarSdk from '@stellar/stellar-sdk';

const HORIZON = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const PASSPHRASE = StellarSdk.Networks.TESTNET;
const ESCROW = process.env.ESCROW_DESTINATION || 
  'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN';

function isValidKey(k: any) {
  return typeof k === 'string' && k.length === 56 && k.startsWith('G');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { investorPublicKey, amountUSD, invoiceId } = req.body;

  if (!isValidKey(investorPublicKey)) {
    return res.status(400).json({ 
      error: `Invalid public key: "${investorPublicKey}"` 
    });
  }

  const safeAmount = Number(amountUSD);
  if (isNaN(safeAmount) || safeAmount <= 0) {
    return res.status(400).json({ error: `Invalid amount: ${amountUSD}` });
  }

  let account: any;
  try {
    account = await HORIZON.loadAccount(investorPublicKey);
  } catch (e: any) {
    if (e?.response?.status === 404) {
      return res.status(400).json({
        error: 'Wallet not activated on testnet. Fund at: https://laboratory.stellar.org/#account-creator?network=test'
      });
    }
    return res.status(400).json({ error: `Account load failed: ${e.message}` });
  }

  const xlmBal = account.balances.find((b: any) => b.asset_type === 'native');
  const xlmNeeded = (safeAmount / 0.11) + 2;
  if (!xlmBal || parseFloat(xlmBal.balance) < xlmNeeded) {
    return res.status(400).json({
      error: `Insufficient XLM. Need ${xlmNeeded.toFixed(2)}, have ${xlmBal?.balance || 0}`
    });
  }

  try {
    await HORIZON.loadAccount(ESCROW);
  } catch {
    return res.status(400).json({ error: 'Escrow account not found on testnet.' });
  }

  const xlmAmount = (safeAmount / 0.11).toFixed(7);
  const memo = `FUND:${String(invoiceId).substring(0, 22)}`;

  try {
    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: PASSPHRASE,
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: ESCROW,
        asset: StellarSdk.Asset.native(),
        amount: xlmAmount,
      }))
      .addMemo(StellarSdk.Memo.text(memo))
      .setTimeout(30)
      .build();

    return res.status(200).json({ 
      xdr: tx.toXDR(), 
      xlmAmount, 
      destination: ESCROW 
    });
  } catch (e: any) {
    return res.status(500).json({ error: `Build failed: ${e.message}` });
  }
}
