import fs from "fs";
import path from "path";
const invoiceFile = path.join(process.cwd(), "data", "invoices.json");
const transactionFile = path.join(process.cwd(), "data", "transactions.json");
const visitorFile = path.join(process.cwd(), "data", "visitors.json");
const globalStore = globalThis;
function readJson(filePath, fallback) {
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
    catch {
        return fallback;
    }
}
function writeJson(filePath, value) {
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}
export function getStore() {
    if (!globalStore.__stellar99_store) {
        globalStore.__stellar99_store = {
            invoices: readJson(invoiceFile, []),
            transactions: readJson(transactionFile, []),
            visitors: readJson(visitorFile, []),
        };
    }
    return globalStore.__stellar99_store;
}
export function persistStore() {
    const store = getStore();
    try {
        writeJson(invoiceFile, store.invoices);
        writeJson(transactionFile, store.transactions);
        writeJson(visitorFile, store.visitors);
    }
    catch {
        // Vercel production is effectively in-memory for this demo build.
    }
}
