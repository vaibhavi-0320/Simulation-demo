// @ts-nocheck
import jwt from "jsonwebtoken";
import { Keypair } from "@stellar/stellar-sdk";
import { getSupabase } from "./supabase.ts";
import { getEnv } from "./env.ts";
import { HttpError } from "./errors.ts";
import { logger } from "./logger.ts";

export interface WalletJWT {
  address: string;
  role: "user";
  iat: number;
  exp: number;
}

const NONCE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const JWT_EXPIRY = "15m"; // 15 minute expiry

/**
 * Generate a random nonce for wallet challenge
 */
function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Create a challenge nonce for a wallet address
 */
export async function createChallenge(address: string): Promise<{ nonce: string }> {
  try {
    const nonce = generateNonce();
    const db = getSupabase();
    const expiresAt = new Date(Date.now() + NONCE_EXPIRY_MS).toISOString();

    const { error } = await (db.from("nonces") as any).insert([
      {
        address,
        nonce,
        consumed: false,
        expires_at: expiresAt,
      },
    ]);

    if (error) {
      logger.error({ error }, "Failed to create nonce");
      throw new HttpError(500, "Failed to generate challenge");
    }

    logger.info({ address }, "Challenge created for wallet");
    return { nonce };
  } catch (error) {
    logger.error({ error }, "Error creating challenge");
    if (error instanceof HttpError) throw error;
    throw new HttpError(500, "Challenge generation failed");
  }
}

/**
 * Verify wallet signature and issue JWT
 */
export async function verifySignature(address: string, signature: string, nonce: string): Promise<{ token: string }> {
  try {
    // Validate address format (Stellar public key)
    if (!address.startsWith("G") || address.length !== 56) {
      throw new HttpError(400, "Invalid Stellar address format");
    }

    // Get nonce from database
    const db = getSupabase();
    const { data: nonceData, error: nonceError } = await db
      .from("nonces")
      .select("*")
      .eq("address", address)
      .eq("nonce", nonce)
      .eq("consumed", false)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (nonceError || !nonceData) {
      logger.warn({ address, hasNonce: Boolean(nonceData) }, "Invalid or expired nonce");
      throw new HttpError(401, "Invalid or expired nonce");
    }

    // Verify Freighter signature using Stellar SDK
    try {
      const keypair = Keypair.fromPublicKey(address);
      const isValid = keypair.verify(Buffer.from(nonce), Buffer.from(signature, "base64"));

      if (!isValid) {
        throw new HttpError(401, "Signature verification failed");
      }
    } catch (error) {
      if (error instanceof HttpError) throw error;
      logger.error({ error }, "Signature verification error");
      throw new HttpError(401, "Signature verification failed");
    }

    // Mark nonce as consumed
    await (db.from("nonces") as any).update({ consumed: true }).eq("id", nonceData.id);

    // Generate JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error({}, "JWT_SECRET not configured");
      throw new HttpError(500, "Authentication service misconfigured");
    }

    const token = jwt.sign(
      {
        address,
        role: "user",
      },
      secret,
      { expiresIn: JWT_EXPIRY }
    );

    logger.info({ address }, "Wallet authenticated successfully");
    return { token };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    logger.error({ error }, "Error verifying signature");
    throw new HttpError(500, "Authentication failed");
  }
}

/**
 * Verify JWT token and extract wallet address
 */
export function verifyJWT(token: string): WalletJWT {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new HttpError(500, "Authentication service misconfigured");
    }

    const decoded = jwt.verify(token, secret) as WalletJWT;
    return decoded;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (error instanceof jwt.JsonWebTokenError) {
      throw new HttpError(401, "Invalid or expired token");
    }
    logger.error({ error }, "JWT verification error");
    throw new HttpError(401, "Authentication failed");
  }
}

/**
 * Middleware to verify JWT from Authorization header
 */
export function verifyJWTMiddleware(req: any, _res: any, next: any) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new HttpError(401, "Missing or invalid authorization header");
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix
    const decoded = verifyJWT(token);

    // Attach wallet info to request
    req.wallet = {
      address: decoded.address,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}
