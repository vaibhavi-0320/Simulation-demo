import * as StellarSdk from "stellar-sdk";
import { jsonError } from "../../../backend/service";
const HORIZON = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
const PASSPHRASE = StellarSdk.Networks.TESTNET;
function mapSubmitError(error) {
    const codes = error?.response?.data?.extras?.result_codes;
    const txCode = codes?.transaction;
    const opCode = Array.isArray(codes?.operations) ? codes.operations[0] : undefined;
    if (txCode === "tx_bad_seq") {
        return "Sequence mismatch on Stellar. Refresh and try again.";
    }
    if (opCode === "op_underfunded" || txCode === "tx_insufficient_balance") {
        return "Insufficient XLM to complete this transaction.";
    }
    if (opCode === "op_no_destination") {
        return "Destination wallet not activated on Stellar testnet.";
    }
    if (error?.message?.toLowerCase().includes("timeout")) {
        return "Stellar network timeout. Please retry the transaction.";
    }
    return error?.response?.data?.detail || error?.message || "Unable to submit Stellar transaction.";
}
export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed." });
        return;
    }
    try {
        const signedXdr = String(req.body?.signedXdr || "");
        if (!signedXdr) {
            res.status(400).json({ error: "Missing signedXdr" });
            return;
        }
        const transaction = StellarSdk.TransactionBuilder.fromXDR(signedXdr, PASSPHRASE);
        const result = await HORIZON.submitTransaction(transaction);
        res.status(200).json({
            success: true,
            txHash: result.hash,
            explorerUrl: `https://stellar.expert/explorer/testnet/tx/${result.hash}`,
        });
    }
    catch (error) {
        res.status(400).json({ error: mapSubmitError(error), details: jsonError(error) });
    }
}
