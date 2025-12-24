import { computeTotals, fmtMoney, type Item } from "@/lib/invoiceCalc";

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

export default function InvoiceTemplate({ data }: { data: InvoiceData }) {
  const totals = computeTotals({
    items: data.items,
    gstEnabled: data.gstEnabled,
    gstRate: data.gstRate,
  });

  return (
    <div className="bg-white text-black p-10">
      <div className="flex justify-between gap-6">
        <div>
          <div className="text-xl font-extrabold">{data.sellerName}</div>
          <div className="text-zinc-600">{data.sellerEmail}</div>
        </div>

        <div className="text-right">
          <div className="text-xl font-extrabold">INVOICE</div>
          <div className="text-zinc-600"># {data.invoiceNumber}</div>
          <div className="text-zinc-600">Issue: {data.issueDate}</div>
          <div className="text-zinc-600">Due: {data.dueDate}</div>
          {data.reference ? (
            <div className="text-zinc-600">Ref: {data.reference}</div>
          ) : null}
        </div>
      </div>

      <div className="border border-zinc-200 rounded-xl p-3 mt-4">
        <div className="font-bold mb-1">Bill To</div>
        <div>{data.buyerName}</div>
      </div>

      <table className="w-full border-collapse mt-4">
        <thead>
          <tr className="border-b border-zinc-200">
            <th className="text-left font-bold py-2">Description</th>
            <th className="text-right font-bold py-2">Qty</th>
            <th className="text-right font-bold py-2">Unit</th>
            <th className="text-right font-bold py-2">Line Total</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((it, idx) => {
            const lineTotal = it.quantity * it.unitPriceCents;
            return (
              <tr key={idx} className="border-b border-zinc-200">
                <td className="py-2">{it.description}</td>
                <td className="py-2 text-right">{it.quantity}</td>
                <td className="py-2 text-right">
                  {fmtMoney(it.unitPriceCents, data.currency)}
                </td>
                <td className="py-2 text-right">
                  {fmtMoney(lineTotal, data.currency)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="w-[320px] ml-auto mt-3">
        <div className="flex justify-between py-1">
          <span className="text-zinc-600">Subtotal</span>
          <span>{fmtMoney(totals.subtotalCents, data.currency)}</span>
        </div>

        {data.gstEnabled ? (
          <div className="flex justify-between py-1">
            <span className="text-zinc-600">GST</span>
            <span>{fmtMoney(totals.taxTotalCents, data.currency)}</span>
          </div>
        ) : null}

        <div className="flex justify-between py-2 border-t border-zinc-200 font-extrabold text-lg">
          <span>Total</span>
          <span>{fmtMoney(totals.totalCents, data.currency)}</span>
        </div>
      </div>

      <div className="border border-zinc-200 rounded-xl p-3 mt-4">
        <div className="font-bold mb-1">Payment</div>
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
