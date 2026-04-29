export default function handler(_req, res) {
    res.status(200).json({ status: "ok", service: "stellar99-api" });
}
