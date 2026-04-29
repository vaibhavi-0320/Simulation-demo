import { invoiceAllHandler } from "../../../backend/apiHandlers.ts";
export default async function handler(req, res) {
    await invoiceAllHandler(req, res);
}
