import pino from "pino";
export const logger = pino({
    level: process.env.LOG_LEVEL || "info",
    redact: {
        paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "res.headers.set-cookie",
            "*.apiKey",
            "*.token",
            "*.secret",
            "*.password",
        ],
        censor: "[redacted]",
    },
});
export function truncateForLog(value, maxLength = 1200) {
    const serialized = typeof value === "string" ? value : JSON.stringify(value);
    return serialized.length > maxLength ? `${serialized.slice(0, maxLength)}...` : serialized;
}
