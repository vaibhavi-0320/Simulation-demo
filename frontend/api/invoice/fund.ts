import { invoiceFundHandler } from "../../../backend/apiHandlers.ts";

export default async function handler(req: any, res: any) {
  await invoiceFundHandler(req, res);
}
