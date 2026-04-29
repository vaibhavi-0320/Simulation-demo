import { invoiceListHandler } from "../../../backend/apiHandlers.ts";
export default async function handler(req, res) {
    await invoiceListHandler(req, res);
}
