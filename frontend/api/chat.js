import { askAssistant, jsonError } from "../../backend/service";
export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed." });
        return;
    }
    try {
        res.status(200).json(await askAssistant({
            question: String(req.body?.question || ""),
            walletAddress: req.body?.walletAddress,
            view: req.body?.view,
            history: Array.isArray(req.body?.history) ? req.body.history : [],
        }));
    }
    catch (error) {
        res.status(500).json(jsonError(error));
    }
}
