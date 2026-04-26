import { createClient } from "@supabase/supabase-js";
import { getEnv } from "./env.ts";

let supabaseClient: ReturnType<typeof createClient> | null = null;

export function initSupabase() {
  const env = getEnv();

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase configuration: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required");
  }

  if (!supabaseClient) {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }

  return supabaseClient;
}

export function getSupabase() {
  if (!supabaseClient) {
    return initSupabase();
  }
  return supabaseClient;
}

// Type definitions for database schema
export interface InvoiceRow {
  id: string;
  seller_user_id: string | null;
  funder_user_id: string | null;
  buyer: string;
  amount: number;
  discount: number;
  due: string;
  status: "active" | "funded" | "repaid";
  seller: string;
  funder: string | null;
  yield: number;
  funded: number;
  tags: string[];
  risk_score: number | null;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionRow {
  id: string;
  actor_user_id: string | null;
  type: "Fund" | "List" | "Repay";
  name: string;
  amount: string;
  xlm: string;
  status: "Success" | "Pending";
  time: string;
  created_at: string;
  idempotency_key: string | null;
}

export interface VisitorRow {
  id: string;
  user_id: string | null;
  first_seen_at: string;
  last_seen_at: string;
  visits: number;
  user_agent: string | null;
  language: string | null;
  platform: string | null;
  consented: boolean;
  created_at: string;
  updated_at: string;
}

export interface NonceRow {
  id: string;
  address: string;
  nonce: string;
  consumed: boolean;
  expires_at: string;
  created_at: string;
}
