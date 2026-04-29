import { invoiceUploadHandler } from "../../../backend/apiHandlers.ts";
export default async function handler(req, res) {
    await invoiceUploadHandler(req, res);
}
