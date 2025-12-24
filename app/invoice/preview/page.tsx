"use client";

/**
 * Invoice preview + editor page
 * -----------------------------
 * This page:
 * - Stores the entire invoice as a single object in React state
 * - Persists that invoice to localStorage (so refresh won't lose work)
 * - Renders a printable invoice preview using <InvoiceTemplate />
 */

import { useState } from "react";
import InvoiceTemplate from "@/components/InvoiceTemplate";
import {
  usePersistedInvoice,
  type FullInvoiceData,
} from "@/lib/useInvoiceSettings";

export default function InvoicePreviewPage() {
  /**
   * Single source of truth for the entire invoice.
   * Saving this whole object means "everything is remembered" across refresh.
   */
  const [invoice, setInvoice] = useState<FullInvoiceData>({
    sellerName: "Outfit Club",
    sellerEmail: "admin@outfitclub.co.nz",
    buyerName: "Unitec Filipino Club",

    invoiceNumber: "OC-2026-000001",
    issueDate: "2025-12-24",
    dueDate: "2025-12-31",
    currency: "NZD",
    reference: "Order #4812",

    gstEnabled: true,
    gstRate: 0.15,

    bankDetails:
      "Bank: ANZ\nAccount: 12-1234-1234567-00\nReference: invoice number",
    instructions: "Please pay by due date.",

    items: [
      {
        description: "Custom printed tees",
        quantity: 15,
        unitPriceCents: 3000,
      },
      { description: "Setup fee", quantity: 1, unitPriceCents: 2500 },
    ],
  });

  /**
   * Persist the ENTIRE invoice to localStorage:
   * - Load once on first render
   * - Auto-save whenever invoice changes
   */
  usePersistedInvoice({ invoice, setInvoice });

  return (
    <div className="p-6 space-y-4">
      {/* Buttons (hidden when printing) */}
      <div className="no-print flex gap-2">
        <button
          className="px-4 py-2 rounded-lg bg-black text-white"
          onClick={() => window.print()}
        >
          Print / Save as PDF
        </button>

        <button
          className="px-4 py-2 rounded-lg border"
          onClick={() => {
            // Adds a blank line item
            setInvoice({
              ...invoice,
              items: [
                ...invoice.items,
                { description: "", quantity: 1, unitPriceCents: 0 },
              ],
            });
          }}
        >
          + Add item
        </button>
      </div>

      {/* Editor (hidden when printing) */}
      <div className="no-print grid gap-3 border rounded-xl p-4 max-w-4xl">
        <div className="font-semibold">Edit Invoice</div>

        {/* Seller/Buyer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="border rounded-lg p-2"
            value={invoice.sellerName}
            onChange={(e) =>
              setInvoice({ ...invoice, sellerName: e.target.value })
            }
            placeholder="Seller name"
          />
          <input
            className="border rounded-lg p-2"
            value={invoice.sellerEmail}
            onChange={(e) =>
              setInvoice({ ...invoice, sellerEmail: e.target.value })
            }
            placeholder="Seller email"
          />
          <input
            className="border rounded-lg p-2"
            value={invoice.buyerName}
            onChange={(e) =>
              setInvoice({ ...invoice, buyerName: e.target.value })
            }
            placeholder="Buyer name"
          />
        </div>

        {/* Invoice meta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="border rounded-lg p-2"
            value={invoice.invoiceNumber}
            onChange={(e) =>
              setInvoice({ ...invoice, invoiceNumber: e.target.value })
            }
            placeholder="Invoice number"
          />
          <input
            className="border rounded-lg p-2"
            value={invoice.issueDate}
            onChange={(e) =>
              setInvoice({ ...invoice, issueDate: e.target.value })
            }
            placeholder="Issue date (YYYY-MM-DD)"
          />
          <input
            className="border rounded-lg p-2"
            value={invoice.dueDate}
            onChange={(e) =>
              setInvoice({ ...invoice, dueDate: e.target.value })
            }
            placeholder="Due date (YYYY-MM-DD)"
          />
          <input
            className="border rounded-lg p-2"
            value={invoice.currency}
            onChange={(e) =>
              setInvoice({ ...invoice, currency: e.target.value.toUpperCase() })
            }
            placeholder="Currency (e.g. NZD)"
          />
          <input
            className="border rounded-lg p-2 md:col-span-2"
            value={invoice.reference}
            onChange={(e) =>
              setInvoice({ ...invoice, reference: e.target.value })
            }
            placeholder="Reference (optional)"
          />
        </div>

        {/* GST */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={invoice.gstEnabled}
            onChange={(e) =>
              setInvoice({ ...invoice, gstEnabled: e.target.checked })
            }
          />
          GST enabled
        </label>

        {invoice.gstEnabled && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600">GST rate</span>
            <input
              className="border rounded-lg p-2 w-40"
              type="number"
              step="0.01"
              value={invoice.gstRate}
              onChange={(e) =>
                setInvoice({ ...invoice, gstRate: Number(e.target.value) })
              }
              placeholder="0.15"
            />
          </div>
        )}

        {/* Payment */}
        <div className="font-semibold mt-2">Payment</div>
        <textarea
          className="border rounded-lg p-2 min-h-[90px]"
          value={invoice.bankDetails}
          onChange={(e) =>
            setInvoice({ ...invoice, bankDetails: e.target.value })
          }
        />
        <input
          className="border rounded-lg p-2"
          value={invoice.instructions}
          onChange={(e) =>
            setInvoice({ ...invoice, instructions: e.target.value })
          }
          placeholder="Payment instructions"
        />

        {/* Line items editor */}
        <div className="font-semibold mt-2">Line items</div>

        <div className="grid grid-cols-12 gap-2 text-sm text-zinc-600">
          <div className="col-span-6">Description</div>
          <div className="col-span-2 text-right">Qty</div>
          <div className="col-span-2 text-right">Unit</div>
          <div className="col-span-2 text-right">Line Total</div>
        </div>

        {invoice.items.map((it, idx) => {
          const lineTotalCents = it.quantity * it.unitPriceCents;

          return (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <input
                className="col-span-6 border rounded-lg p-2"
                value={it.description}
                onChange={(e) => {
                  const nextItems = [...invoice.items];
                  nextItems[idx] = {
                    ...nextItems[idx],
                    description: e.target.value,
                  };
                  setInvoice({ ...invoice, items: nextItems });
                }}
                placeholder="Description"
              />

              <input
                className="col-span-2 border rounded-lg p-2 text-right"
                type="number"
                min={1}
                value={it.quantity}
                onChange={(e) => {
                  const nextItems = [...invoice.items];
                  nextItems[idx] = {
                    ...nextItems[idx],
                    quantity: Number(e.target.value),
                  };
                  setInvoice({ ...invoice, items: nextItems });
                }}
                placeholder="Qty"
              />

              <input
                className="col-span-2 border rounded-lg p-2 text-right"
                type="number"
                step="0.01"
                min={0}
                value={(it.unitPriceCents / 100).toFixed(2)}
                onChange={(e) => {
                  const nextItems = [...invoice.items];
                  nextItems[idx] = {
                    ...nextItems[idx],
                    unitPriceCents: Math.round(Number(e.target.value) * 100),
                  };
                  setInvoice({ ...invoice, items: nextItems });
                }}
                placeholder="Unit"
              />

              <div className="col-span-2 text-right font-medium">
                {(lineTotalCents / 100).toFixed(2)}
              </div>

              {/* Remove item */}
              <div className="col-span-12 flex justify-end">
                <button
                  className="text-sm text-red-600 hover:underline"
                  onClick={() => {
                    const nextItems = invoice.items.filter((_, i) => i !== idx);
                    setInvoice({ ...invoice, items: nextItems });
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview */}
      <div className="print-page bg-white">
        <InvoiceTemplate data={invoice} />
      </div>
    </div>
  );
}
