import { jsonError, repayInvoice } from "../../backend/service";

export default function handler(req: any, res: any) {
  const id = String(req.query?.id || "");
  const action = String(req.query?.action || "");

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    if (action === "repay") {
      res.status(200).json(repayInvoice(id));
      return;
    }

    res.status(400).json({ error: "Unknown action." });
  } catch (error) {
    res.status(400).json(jsonError(error));
  }
}
