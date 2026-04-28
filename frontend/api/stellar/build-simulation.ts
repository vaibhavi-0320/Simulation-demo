import * as StellarSdk from "stellar-sdk";
import { jsonError } from "../../../backend/service";

const HORIZON = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
const PASSPHRASE = StellarSdk.Networks.TESTNET;

function isValidStellarPublicKey(key: string) {
  return typeof key === "string" && StellarSdk.StrKey.isValidEd25519PublicKey(key);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    const investorPublicKey = String(req.body?.investorPublicKey || "");
    const amountUSD = Number(req.body?.amountUSD || 0);
    const invoiceId = String(req.body?.invoiceId || req.body?.dealId || "");

    if (!isValidStellarPublicKey(investorPublicKey)) {
      res.status(400).json({ error: "Invalid Stellar public key format." });
      return;
    }
    if (!Number.isFinite(amountUSD) || amountUSD <= 0) {
      res.status(400).json({ error: "Invalid amount. Must be greater than zero." });
      return;
    }

    const account = await HORIZON.loadAccount(investorPublicKey).catch(() => null);
    if (!account) {
      res.status(400).json({
        error: `Wallet not activated on Stellar testnet. Fund it first: https://friendbot.stellar.org?addr=${investorPublicKey}`,
      });
      return;
    }

    const nativeBalance = Number(
      account.balances.find((balance: any) => balance.asset_type === "native")?.balance || 0
    );
    if (nativeBalance < 2) {
      res.status(400).json({ error: `Need at least 2 XLM for simulation. Current balance: ${nativeBalance} XLM.` });
      return;
    }

    const memoText = `SIM:${invoiceId}`.slice(0, 28);
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: String(await HORIZON.fetchBaseFee()),
      networkPassphrase: PASSPHRASE,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: investorPublicKey,
          asset: StellarSdk.Asset.native(),
          amount: "1.0000000",
        })
      )
      .addMemo(StellarSdk.Memo.text(memoText))
      .setTimeout(30)
      .build();

    res.status(200).json({ xdr: transaction.toXDR(), memo: memoText });
  } catch (error) {
    res.status(400).json(jsonError(error));
  }
}
