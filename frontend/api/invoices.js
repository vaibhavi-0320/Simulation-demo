import { createInvoice, jsonError, listInvoices } from "../../backend/service";
export default function handler(req, res) {
    if (req.method === "GET") {
        res.status(200).json(listInvoices());
        return;
    }
    if (req.method === "POST") {
        try {
            res.status(201).json(createInvoice(req.body));
        }
        catch (error) {
            res.status(400).json(jsonError(error));
        }
        return;
    }
    res.status(405).json({ error: "Method not allowed." });
}
