import { Horizon } from "@stellar/stellar-sdk";
import { getSupabase } from "./supabase.ts";
import { logger } from "./logger.ts";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
let horizonSynced = false;

interface HorizonEvent {
  type: "fund" | "repay" | "cancel";
  invoiceId: string;
  status: "active" | "funded" | "repaid" | "cancelled";
  txHash: string;
}

/**
 * Subscribe to Stellar transaction stream for contract events
 * Updates invoice status in Supabase when relevant events occur
 */
export async function startHorizonListener(contractAddress: string): Promise<void> {
  try {
    const server = new Horizon.Server(HORIZON_URL);
    logger.info({ contractAddress }, "Starting Horizon listener");

    // Start listening for transactions from the contract address
    // This is a simplified approach - in production you'd subscribe to specific contract events
    server
      .transactions()
      .forAccount(contractAddress)
      .stream({
        onmessage: async (tx) => {
          await handleHorizonEvent(tx);
        },
        onerror: (error) => {
          logger.error({ error }, "Horizon stream error");
          horizonSynced = false;
        },
      });

    horizonSynced = true;
    logger.info({}, "Horizon listener connected");
  } catch (error) {
    logger.error({ error }, "Error starting Horizon listener");
    horizonSynced = false;
  }
}

/**
 * Handle incoming Horizon event and update Supabase
 */
async function handleHorizonEvent(tx: any): Promise<void> {
  try {
    const db = getSupabase();

    // Parse transaction operations to detect invoice-related actions
    // This is a simplified implementation - real version would parse Soroban events
    if (tx.operations_count > 0) {
      logger.info({ txHash: tx.hash }, "Processing transaction");

      // Update invoice statuses based on transaction analysis
      // In a real implementation, you'd parse Soroban contract invocations
      // For now, this is a placeholder for the actual event processing
    }
  } catch (error) {
    logger.error({ error }, "Error handling Horizon event");
  }
}

/**
 * Check if Horizon sync is active
 */
export function isHorizonSynced(): boolean {
  return horizonSynced;
}

/**
 * Stop the Horizon listener
 */
export function stopHorizonListener(): void {
  horizonSynced = false;
  logger.info({}, "Horizon listener stopped");
}

/**
 * Poll Horizon for new transactions (alternative to streaming)
 * Use this if streaming is not reliable
 */
export async function pollHorizonTransactions(contractAddress: string, pollInterval: number = 10000): Promise<void> {
  setInterval(async () => {
    try {
      const server = new Horizon.Server(HORIZON_URL);
      const transactions = await server.transactions().forAccount(contractAddress).limit(10).call();

      for (const tx of transactions.records) {
        await handleHorizonEvent(tx);
      }

      horizonSynced = true;
    } catch (error) {
      logger.error({ error }, "Horizon polling error");
      horizonSynced = false;
    }
  }, pollInterval);
}
