import { invoiceListHandler } from "../../../backend/apiHandlers.ts";

export default async function handler(req: any, res: any) {
  await invoiceListHandler(req, res);
}
