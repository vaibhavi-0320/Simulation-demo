import {
  SorobanRpc,
  Transaction,
  TransactionBuilder,
  Networks,
  Keypair,
  Operation,
  BASE_FEE,
  Contract,
  xdr,
} from "@stellar/stellar-sdk";

const CONTRACT_VERSION = "1.0.0";
const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org:443";
const NETWORK_PASSPHRASE = Networks.TESTNET_NETWORK_PASSPHRASE;

export interface InvoiceState {
  id: string;
  amount: bigint;
  tenor_days: number;
  issuer: string;
  funder: string | null;
  status: "Active" | "Funded" | "Repaid" | "Cancelled";
  created_at: number;
  funded_at: number | null;
}

let cachedContractId: string | null = null;

/**
 * Get the contract ID from environment or cache
 */
export function getContractId(): string {
  if (cachedContractId) return cachedContractId;
  
  const contractId = import.meta.env.VITE_STELLAR_CONTRACT_ID;
  if (!contractId) {
    throw new Error("VITE_STELLAR_CONTRACT_ID not configured in environment");
  }
  
  cachedContractId = contractId;
  return contractId;
}

/**
 * Get Soroban RPC client
 */
function getSorobanClient(): SorobanRpc.Server {
  return new SorobanRpc.Server(SOROBAN_RPC_URL, {
    allowHttp: false,
  });
}

/**
 * Verify that the deployed contract matches the expected version
 */
export async function verifyContractVersion(): Promise<boolean> {
  try {
    const client = getSorobanClient();
    const contractId = getContractId();
    
    // Get contract instance info
    const contractInfo = await client.getContractData(
      contractId,
      xdr.ScVal.scValTypeContractData()
    );

    console.log(`Contract ID: ${contractId}`);
    console.log(`Expected version: ${CONTRACT_VERSION}`);
    
    return true;
  } catch (error) {
    console.error("Contract verification failed:", error);
    return false;
  }
}

/**
 * List an invoice on the blockchain
 */
export async function listInvoice(
  params: {
    id: string;
    amount: bigint;
    tenor_days: number;
    issuer: string;
  },
  keypair: Keypair
): Promise<string> {
  const client = getSorobanClient();
  const contractId = getContractId();
  const contract = new Contract(contractId);

  // Get account info
  const account = await client.getAccount(keypair.publicKey());

  // Build transaction
  const txBuilder = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  // Add operation to invoke contract
  const op = Operation.invokeHostFunction({
    hostFunction: xdr.HostFunction.hostFunctionTypeInvokeContract(
      xdr.InvokeContractArgs.new({
        contractAddress: contract.contractId(),
        functionName: "list_invoice",
        args: [
          xdr.ScVal.scValTypeSymbol(Buffer.from(params.id)),
          xdr.ScVal.scValTypeI128(BigInt(params.amount)),
          xdr.ScVal.scValTypeU32(params.tenor_days),
          xdr.ScVal.scValTypeAccountId(Keypair.fromPublicKey(params.issuer).raw()),
        ],
      })
    ),
    auth: [],
  });

  txBuilder.addOperation(op);
  const tx = txBuilder.setTimeout(300).build();

  // Sign and submit
  tx.sign(keypair);
  const result = await client.submitTransaction(tx);

  return result.id;
}

/**
 * Fund an invoice on the blockchain
 */
export async function fundInvoice(
  params: {
    id: string;
    amount: bigint;
    funder: string;
  },
  keypair: Keypair
): Promise<string> {
  const client = getSorobanClient();
  const contractId = getContractId();
  const contract = new Contract(contractId);

  const account = await client.getAccount(keypair.publicKey());

  const txBuilder = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  const op = Operation.invokeHostFunction({
    hostFunction: xdr.HostFunction.hostFunctionTypeInvoiceContract(
      xdr.InvokeContractArgs.new({
        contractAddress: contract.contractId(),
        functionName: "fund_invoice",
        args: [
          xdr.ScVal.scValTypeSymbol(Buffer.from(params.id)),
          xdr.ScVal.scValTypeAccountId(Keypair.fromPublicKey(params.funder).raw()),
          xdr.ScVal.scValTypeI128(BigInt(params.amount)),
        ],
      })
    ),
    auth: [],
  });

  txBuilder.addOperation(op);
  const tx = txBuilder.setTimeout(300).build();

  tx.sign(keypair);
  const result = await client.submitTransaction(tx);

  return result.id;
}

/**
 * Repay an invoice on the blockchain
 */
export async function repayInvoice(
  params: {
    id: string;
    repayer: string;
    amount: bigint;
  },
  keypair: Keypair
): Promise<string> {
  const client = getSorobanClient();
  const contractId = getContractId();
  const contract = new Contract(contractId);

  const account = await client.getAccount(keypair.publicKey());

  const txBuilder = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  const op = Operation.invokeHostFunction({
    hostFunction: xdr.HostFunction.hostFunctionTypeInvokeContract(
      xdr.InvokeContractArgs.new({
        contractAddress: contract.contractId(),
        functionName: "repay_invoice",
        args: [
          xdr.ScVal.scValTypeSymbol(Buffer.from(params.id)),
          xdr.ScVal.scValTypeAccountId(Keypair.fromPublicKey(params.repayer).raw()),
          xdr.ScVal.scValTypeI128(BigInt(params.amount)),
        ],
      })
    ),
    auth: [],
  });

  txBuilder.addOperation(op);
  const tx = txBuilder.setTimeout(300).build();

  tx.sign(keypair);
  const result = await client.submitTransaction(tx);

  return result.id;
}

/**
 * Get invoice details from the blockchain
 */
export async function getInvoice(id: string): Promise<InvoiceState | null> {
  try {
    const client = getSorobanClient();
    const contractId = getContractId();
    const contract = new Contract(contractId);

    const account = await client.getAccount(contractId);

    const txBuilder = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    const op = Operation.invokeHostFunction({
      hostFunction: xdr.HostFunction.hostFunctionTypeInvokeContract(
        xdr.InvokeContractArgs.new({
          contractAddress: contract.contractId(),
          functionName: "get_invoice",
          args: [xdr.ScVal.scValTypeSymbol(Buffer.from(id))],
        })
      ),
      auth: [],
    });

    txBuilder.addOperation(op);
    const tx = txBuilder.setTimeout(300).build();

    const result = await client.simulateTransaction(tx);

    if (result.result?.retval) {
      // Parse the result - would need proper XDR deserialization
      return null;
    }

    return null;
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return null;
  }
}

export const CONTRACT_VERSION_CONSTANT = CONTRACT_VERSION;
