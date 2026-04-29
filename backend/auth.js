import { authenticateRequest, clerkClient, getAuth } from "@clerk/express";
import { getAllowedOrigins, getEnv } from "./env.ts";
import { HttpError } from "./errors.ts";
export function roleForUser(userId) {
    const adminIds = getEnv().CLERK_ADMIN_USER_IDS.split(",").map((id) => id.trim()).filter(Boolean);
    return adminIds.includes(userId) ? "admin" : "user";
}
export function getAuthContext(req) {
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
export function requireAuthJson(req, _res, next) {
    try {
        getAuthContext(req);
        next();
    }
    catch (error) {
        next(error);
    }
}
export function requireRole(role) {
    return (req, _res, next) => {
        try {
            const context = getAuthContext(req);
            if (context.role !== role) {
                throw new HttpError(403, "Forbidden.");
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
export async function getServerlessAuthContext(req) {
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
