import { invoiceAllHandler } from "../../../backend/apiHandlers.ts";

export default async function handler(req: any, res: any) {
  await invoiceAllHandler(req, res);
}
