export type Item = { description: string; quantity: number; unitPriceCents: number };

export function fmtMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-NZ", { style: "currency", currency }).format(
    cents / 100
  );
}

export function computeTotals(params: {
  items: Item[];
  gstEnabled: boolean;
  gstRate: number; // e.g. 0.15
}) {
  const subtotalCents = params.items.reduce(
    (sum, it) => sum + it.quantity * it.unitPriceCents,
    0
  );

  // invoice-level rounding
  const taxTotalCents = params.gstEnabled
    ? Math.round(subtotalCents * params.gstRate)
    : 0;

  const totalCents = subtotalCents + taxTotalCents;

  return { subtotalCents, taxTotalCents, totalCents };
}
