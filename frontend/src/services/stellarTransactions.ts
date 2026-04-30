import {
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  Memo,
  Horizon,
  Keypair,
} from '@stellar/stellar-sdk';
import { signTransaction, isConnected, getAddress } from '@stellar/freighter-api';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET; // 'Test SDF Network ; September 2015'
const server = new Horizon.Server(HORIZON_URL);

// Check Freighter is installed and connected
export async function checkFreighter(): Promise<string> {
  const connected = await isConnected();
  if (!connected || !connected.isConnected) {
    throw new Error('Freighter wallet not connected. Please connect first.');
  }
  const result = await getAddress();
  if (!result?.address) throw new Error('Could not get wallet address from Freighter.');
  return result.address;
}

// Build, sign, and submit a payment transaction
export async function fundInvoiceOnChain(params: {
  funderPublicKey: string;
  amountXLM: string;
  invoiceId: string;
  recipientPublicKey?: string;
}): Promise<{ txHash: string; success: boolean; explorerUrl: string }> {
  const { funderPublicKey, amountXLM, invoiceId, recipientPublicKey } = params;

  // Step 1: Load the funder account from Horizon (no backend needed)
  const account = await server.loadAccount(funderPublicKey);

  // Step 2: Build the transaction entirely in the frontend
  const transaction = new TransactionBuilder(account, {
    fee: '100000', // 0.01 XLM base fee
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination: recipientPublicKey || funderPublicKey, // send to escrow or self for simulation
        asset: Asset.native(), // XLM
        amount: amountXLM,
      })
    )
    .addMemo(Memo.text(`FINTRIX-${invoiceId}`.substring(0, 28)))
    .setTimeout(300)
    .build();

  // Step 3: Sign with Freighter — THIS opens the Freighter popup immediately
  const signResult = await signTransaction(transaction.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: funderPublicKey,
  });

  // Handle different Freighter response formats
  const signedXdr = (signResult as any)?.signedTxXdr 
    || (signResult as any)?.xdr
    || (signResult as any)?.signed_envelope_xdr
    || (typeof signResult === 'string' ? signResult : '');

  if (!signedXdr) throw new Error('Transaction signing was cancelled or failed.');

  // Step 4: Submit to Horizon testnet
  const { TransactionBuilder: TB } = await import('@stellar/stellar-sdk');
  const signedTx = TB.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const submitResult = await server.submitTransaction(signedTx);

  return {
    txHash: submitResult.hash,
    success: true,
    explorerUrl: `https://stellar.expert/explorer/testnet/tx/${submitResult.hash}`,
  };
}

// For simulation — build a dummy transaction to demonstrate signing
export async function buildSimulationTransaction(params: {
  publicKey: string;
  amountXLM: string;
  dealId: string;
}): Promise<{ txHash: string; success: boolean; explorerUrl: string }> {
  const { publicKey, amountXLM, dealId } = params;

  const account = await server.loadAccount(publicKey);

  const transaction = new TransactionBuilder(account, {
    fee: '100000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination: publicKey, // send to self — testnet simulation
        asset: Asset.native(),
        amount: amountXLM,
      })
    )
    .addMemo(Memo.text(`SIMULATE-${dealId}`.substring(0, 28)))
    .setTimeout(300)
    .build();

  // This opens Freighter immediately
  const signResult = await signTransaction(transaction.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: publicKey,
  });

  // Handle different Freighter response formats
  const signedXdr = (signResult as any)?.signedTxXdr 
    || (signResult as any)?.xdr
    || (signResult as any)?.signed_envelope_xdr
    || (typeof signResult === 'string' ? signResult : '');

  if (!signedXdr) throw new Error('Transaction signing was cancelled.');

  const { TransactionBuilder: TB } = await import('@stellar/stellar-sdk');
  const signedTx = TB.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const result = await server.submitTransaction(signedTx);

  return { 
    txHash: result.hash, 
    success: true,
    explorerUrl: `https://stellar.expert/explorer/testnet/tx/${result.hash}`,
  };
}
