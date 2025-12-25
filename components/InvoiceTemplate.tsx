import Image from "next/image";
import { computeTotals, fmtMoney, type Item } from "@/lib/invoiceCalc";

/**
 * InvoiceData
 * ----------
 * The shape of data that the invoice template needs to render.
 * Keep this consistent with what your page editor produces.
 */
export type InvoiceData = {
  sellerName: string;
  sellerEmail: string;
  buyerName: string;

  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  reference?: string;

  gstEnabled: boolean;
  gstRate: number;

  items: Item[];

  bankDetails?: string;
  instructions?: string;
};

/**
 * InvoiceTemplate
 * --------------
 * A printable invoice layout (A4-friendly) with a clean "brand" look.
 * Styling is done with Tailwind classes.
 */
export default function InvoiceTemplate({ data }: { data: InvoiceData }) {
  const totals = computeTotals({
    items: data.items,
    gstEnabled: data.gstEnabled,
    gstRate: data.gstRate,
  });

  return (
    <div className="bg-white text-black pt-1 px-10 pb-10">
      {/* Top row: logo (left) + invoice meta (right) */}
      <div className="flex justify-between items-start">
        <Image
          src="/outfitclub-logo.png"
          alt="Outfit Club logo"
          width={120}
          height={120}
          priority
          className="h-auto"
        />

        <div className="text-right">
          <div className="text-2xl font-extrabold tracking-tight">INVOICE</div>
          <div className="text-zinc-600">Issue: {data.issueDate}</div>
          <div className="text-zinc-600">Due: {data.dueDate}</div>
          {data.reference ? (
            <div className="text-zinc-600">Ref: {data.reference}</div>
          ) : null}
        </div>
      </div>

      {/* Second row: seller + buyer block */}
      <div className="flex justify-between gap-6 mt-6">
        <div>
          <div className="text-2xl font-extrabold tracking-tight">
            {data.sellerName}
          </div>
          <div className="text-zinc-600 mt-2">{data.sellerEmail}</div>
        </div>

        <div className="text-right">
          {/* Optional: you can keep this empty, or put something else here */}
        </div>
      </div>

      {/* Bill to */}
      <div className="border border-zinc-200 rounded-xl p-4 mt-5">
        <div className="font-semibold mb-1">Bill To</div>
        <div className="text-zinc-800">{data.buyerName}</div>
      </div>

      {/* Items table */}
      <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-black text-white">
              <th className="text-left font-semibold py-3 px-4 w-[55%]">
                Description
              </th>
              <th className="text-right font-semibold py-3 px-4 w-[10%]">
                Qty
              </th>
              <th className="text-right font-semibold py-3 px-4 w-[15%]">
                Unit
              </th>
              <th className="text-right font-semibold py-3 px-4 w-[20%]">
                Line Total
              </th>
            </tr>
          </thead>

          <tbody>
            {data.items.map((it, idx) => {
              const lineTotal = it.quantity * it.unitPriceCents;
              const striped = idx % 2 === 0 ? "bg-white" : "bg-zinc-50";

              return (
                <tr key={idx} className={`${striped} border-t border-zinc-200`}>
                  <td className="py-3 px-4">{it.description}</td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    {it.quantity}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    {fmtMoney(it.unitPriceCents, data.currency)}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-medium">
                    {fmtMoney(lineTotal, data.currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals card */}
      <div className="w-[340px] ml-auto mt-5 border border-zinc-200 rounded-xl p-4">
        <div className="flex justify-between py-1">
          <span className="text-zinc-600">Subtotal</span>
          <span className="tabular-nums">
            {fmtMoney(totals.subtotalCents, data.currency)}
          </span>
        </div>

        {data.gstEnabled ? (
          <div className="flex justify-between py-1">
            <span className="text-zinc-600">GST</span>
            <span className="tabular-nums">
              {fmtMoney(totals.taxTotalCents, data.currency)}
            </span>
          </div>
        ) : null}

        <div className="flex justify-between py-3 mt-2 border-t border-zinc-200 font-extrabold text-lg">
          <span>Total</span>
          <span className="tabular-nums">
            {fmtMoney(totals.totalCents, data.currency)}
          </span>
        </div>
      </div>

      {/* Payment */}
      <div className="border border-zinc-200 rounded-xl p-4 mt-5">
        <div className="font-semibold mb-1">Payment</div>
        {data.bankDetails ? (
          <div className="text-zinc-600 whitespace-pre-wrap">
            {data.bankDetails}
          </div>
        ) : null}
        {data.instructions ? (
          <div className="text-zinc-600 mt-2">{data.instructions}</div>
        ) : null}
      </div>
    </div>
  );
}
