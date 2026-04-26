import type { NextFunction, Request, Response } from "express";
import * as Sentry from "@sentry/node";
import { ZodError } from "zod";
import { logger } from "./logger.ts";

export class HttpError extends Error {
  statusCode: number;
  expose: boolean;
  retryAfter?: number;

  constructor(statusCode: number, message: string, options?: { expose?: boolean; retryAfter?: number }) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.expose = options?.expose ?? statusCode < 500;
    this.retryAfter = options?.retryAfter;
  }
}

export function jsonError(error: unknown) {
  if (error instanceof HttpError && error.expose) {
    return { success: false, error: error.message };
  }

  if (error instanceof ZodError) {
    return { success: false, error: "Invalid request payload.", details: error.issues.map((issue) => ({ path: issue.path, message: issue.message })) };
  }

  return { success: false, error: "Unexpected error." };
}

export function statusForError(error: unknown) {
  if (error instanceof HttpError) return error.statusCode;
  if (error instanceof ZodError) return 400;
  return 500;
}

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  const statusCode = statusForError(error);

  if (statusCode >= 500) {
    Sentry.captureException(error);
    logger.error({ error, path: req.path, method: req.method }, "request failed");
  } else {
    logger.warn({ error: error instanceof Error ? error.message : error, path: req.path, method: req.method }, "request rejected");
  }

  if (error instanceof HttpError && error.retryAfter) {
    res.setHeader("Retry-After", String(error.retryAfter));
  }

  res.status(statusCode).json(jsonError(error));
}
