import { jsonError, trackVisitor } from "../../backend/service";

export default function handler(req: any, res: any) {
  if (req.method === "POST") {
    try {
      const visitor = trackVisitor({
        id: String(req.body?.id || ""),
        userAgent: String(req.body?.userAgent || req.headers["user-agent"] || ""),
        language: String(req.body?.language || req.headers["accept-language"] || ""),
        platform: String(req.body?.platform || ""),
      });
      res.status(201).json(visitor);
    } catch (error) {
      res.status(400).json(jsonError(error));
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed." });
}
