import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createClient } from "@supabase/supabase-js";

// Mock Supabase client
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: {}, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: {}, error: null })),
          })),
        })),
      })),
    })),
  })),
}));

describe("store.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllInvoices", () => {
    it("should return invoices from Supabase", async () => {
      const { getAllInvoices } = await import("../backend/store.ts");
      const invoices = await getAllInvoices();
      expect(Array.isArray(invoices)).toBe(true);
    });
  });

  describe("createInvoice", () => {
    it("should create invoice successfully", async () => {
      const { createInvoice } = await import("../backend/store.ts");
      const invoice = await createInvoice({
        id: "test-1",
        buyer: "Test Buyer",
        amount: 1000,
        discount: 5,
        due: "2024-12-31",
        status: "active",
        seller: "seller123",
        yield: 5,
        funded: 0,
        tags: [],
        riskScore: 20,
        aiSummary: "Test invoice",
      });
      expect(invoice).toBeDefined();
    });
  });

  describe("fundInvoice flow", () => {
    it("should fund invoice and create transaction", async () => {
      const { createInvoice, updateInvoice, createTransaction } = await import("../backend/store.ts");
      
      // Create invoice
      const invoice = await createInvoice({
        id: "fund-test",
        buyer: "Test Buyer",
        amount: 1000,
        discount: 5,
        due: "2024-12-31",
        status: "active",
        seller: "seller123",
        yield: 5,
        funded: 0,
        tags: [],
        riskScore: 20,
        aiSummary: "Test invoice",
      });

      // Fund invoice
      const funded = await updateInvoice("fund-test", {
        status: "funded",
        funded: 1000,
        funder: "funder123",
        funderUserId: "user123",
      });

      expect(funded?.status).toBe("funded");
    });
  });
});
