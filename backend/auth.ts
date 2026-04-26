import type { NextFunction, Request, Response } from "express";
import { authenticateRequest, clerkClient, getAuth } from "@clerk/express";
import { getAllowedOrigins, getEnv } from "./env.ts";
import { HttpError } from "./errors.ts";

export type UserRole = "admin" | "user";

export interface AuthContext {
  userId: string;
  role: UserRole;
}

export function roleForUser(userId: string): UserRole {
  const adminIds = getEnv().CLERK_ADMIN_USER_IDS.split(",").map((id) => id.trim()).filter(Boolean);
  return adminIds.includes(userId) ? "admin" : "user";
}

export function getAuthContext(req: Request): AuthContext {
  const env = getEnv();
  if (env.NODE_ENV !== "production" && env.SECURITY_RELAXED_LOCAL === "true") {
    return { userId: "local-dev-user", role: "admin" };
  }

  const auth = getAuth(req);
  if (!auth.isAuthenticated || !auth.userId) {
    throw new HttpError(401, "Unauthorized.");
  }

  return { userId: auth.userId, role: roleForUser(auth.userId) };
}

export function requireAuthJson(req: Request, _res: Response, next: NextFunction) {
  try {
    getAuthContext(req);
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(role: UserRole) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const context = getAuthContext(req);
      if (context.role !== role) {
        throw new HttpError(403, "Forbidden.");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

export async function getServerlessAuthContext(req: Request): Promise<AuthContext> {
  const env = getEnv();
  if (env.NODE_ENV !== "production" && env.SECURITY_RELAXED_LOCAL === "true") {
    return { userId: "local-dev-user", role: "admin" };
  }

  const state = await authenticateRequest({
    clerkClient,
    request: req,
    options: { authorizedParties: getAllowedOrigins() },
  });
  const auth = state.toAuth();

  if (!auth?.isAuthenticated || !auth.userId) {
    throw new HttpError(401, "Unauthorized.");
  }

  return { userId: auth.userId, role: roleForUser(auth.userId) };
}
