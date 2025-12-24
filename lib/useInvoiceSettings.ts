"use client";

import { useEffect } from "react";

/**
 * FullInvoiceData
 * ---------------
 * This is the entire invoice state we want to persist in the browser.
 * It includes line items too.
 */
export type FullInvoiceData = {
  sellerName: string;
  sellerEmail: string;
  buyerName: string;

  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  reference: string;

  gstEnabled: boolean;
  gstRate: number;

  bankDetails: string;
  instructions: string;

  items: Array<{ description: string; quantity: number; unitPriceCents: number }>;
};

const STORAGE_KEY = "invoice_full_state_v1";

/**
 * usePersistedInvoice
 * ------------------
 * Loads invoice state from localStorage on first render,
 * and auto-saves whenever invoice state changes.
 */
export function usePersistedInvoice(params: {
  invoice: FullInvoiceData;
  setInvoice: (next: FullInvoiceData) => void;
}) {
  // Load once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const saved = JSON.parse(raw);

      // Minimal safety: only apply if it looks like an object
      if (!saved || typeof saved !== "object") return;

      params.setInvoice({ ...params.invoice, ...saved });
    } catch {
      // Ignore corrupted data
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params.invoice));
  }, [params.invoice]);
}
