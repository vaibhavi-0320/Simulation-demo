import { jsonError, parseInvoice } from "../../backend/service";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    res.status(200).json(await parseInvoice(req.body?.fileBase64 || "", req.body?.mimeType || "application/octet-stream"));
  } catch (error) {
    res.status(500).json(jsonError(error));
  }
}
