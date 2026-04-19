"use client";

import { useMemo, useState } from "react";

type ItemRow = {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function InvoiceItemsEditor() {
  const [items, setItems] = useState<ItemRow[]>([
    {
      id: "row-1",
      description: "",
      quantity: 1,
      unit_price: 0,
    },
  ]);
  const [tax, setTax] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + Number(item.quantity || 0) * Number(item.unit_price || 0);
    }, 0);
  }, [items]);

  const total = useMemo(() => {
    return Math.max(subtotal + tax - discount, 0);
  }, [subtotal, tax, discount]);

  function updateItem(id: string, field: keyof ItemRow, value: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "description"
                  ? value
                  : Number(value === "" ? 0 : value),
            }
          : item
      )
    );
  }

  function addRow() {
    setItems((prev) => [
      ...prev,
      {
        id: makeId(),
        description: "",
        quantity: 1,
        unit_price: 0,
      },
    ]);
  }

  function removeRow(id: string) {
    setItems((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((item) => item.id !== id);
    });
  }

  const serializedItems = JSON.stringify(
    items.map((item) => ({
      description: item.description,
      quantity: Number(item.quantity || 0),
      unit_price: Number(item.unit_price || 0),
      total: Number(item.quantity || 0) * Number(item.unit_price || 0),
    }))
  );

  return (
    <>
      <input type="hidden" name="items" value={serializedItems} />
      <input type="hidden" name="subtotal" value={subtotal.toFixed(2)} />
      <input type="hidden" name="tax" value={tax.toFixed(2)} />
      <input type="hidden" name="discount" value={discount.toFixed(2)} />
      <input type="hidden" name="total" value={total.toFixed(2)} />

      <div className="mb-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={addRow}
          className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400"
        >
          + Agregar línea
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="hidden grid-cols-12 gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 md:grid">
          <div className="col-span-5">Descripción</div>
          <div className="col-span-2">Cantidad</div>
          <div className="col-span-2">Precio</div>
          <div className="col-span-2">Total</div>
          <div className="col-span-1 text-right">Acción</div>
        </div>

        <div className="space-y-4 p-4">
          {items.map((item) => {
            const lineTotal =
              Number(item.quantity || 0) * Number(item.unit_price || 0);

            return (
              <div
                key={item.id}
                className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 md:grid-cols-12"
              >
                <div className="md:col-span-5">
                  <label className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-slate-400 md:hidden">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(item.id, "description", e.target.value)
                    }
                    placeholder="Ej. Instalación de piso porcelánico"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-slate-400 md:hidden">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.id, "quantity", e.target.value)
                    }
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-slate-400 md:hidden">
                    Precio
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) =>
                      updateItem(item.id, "unit_price", e.target.value)
                    }
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-slate-400 md:hidden">
                    Total
                  </label>
                  <div className="flex h-[46px] items-center rounded-2xl border border-white/10 bg-slate-900/40 px-4 text-sm font-semibold text-white">
                    {money(lineTotal)}
                  </div>
                </div>

                <div className="md:col-span-1">
                  <label className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-slate-400 md:hidden">
                    Acción
                  </label>
                  <button
                    type="button"
                    onClick={() => removeRow(item.id)}
                    className="w-full rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Ajustes</h3>
            <p className="mt-1 text-sm text-slate-400">
              Impuesto y descuento.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Impuesto
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={tax}
                onChange={(e) => setTax(Number(e.target.value || 0))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Descuento
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value || 0))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-400/10"
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Resumen</h3>
            <p className="mt-1 text-sm text-slate-400">
              Totales automáticos.
            </p>
          </div>

          <div className="space-y-3">
            <SummaryRow label="Subtotal" value={money(subtotal)} />
            <SummaryRow label="Impuesto" value={money(tax)} />
            <SummaryRow label="Descuento" value={money(discount)} />

            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">
                Total final
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {money(total)}
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
      <span className="text-sm text-slate-300">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}