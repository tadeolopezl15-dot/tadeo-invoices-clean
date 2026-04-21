"use client";

import { useMemo, useState } from "react";
import { useLang } from "@/components/LanguageProvider";

type Item = {
  description: string;
  quantity: number;
  unit_price: number;
};

export default function NewInvoiceScreen({
  action,
}: {
  action?: (formData: FormData) => void | Promise<void>;
}) {
  const { lang, t } = useLang();

  const [items, setItems] = useState<Item[]>([
    { description: "", quantity: 1, unit_price: 0 },
  ]);

  function updateItem(index: number, field: keyof Item, value: string | number) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unit_price: 0 },
    ]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_price || 0),
      0
    );

    return {
      subtotal,
      tax: 0,
      total: subtotal,
    };
  }, [items]);

  return (
    <form action={action} className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {lang === "es" ? "Nombre del cliente" : "Client name"}
          </label>
          <input
            type="text"
            name="client_name"
            required
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {lang === "es" ? "Correo del cliente" : "Client email"}
          </label>
          <input
            type="email"
            name="client_email"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {lang === "es" ? "Fecha de emisión" : "Issue date"}
          </label>
          <input
            type="date"
            name="issue_date"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {lang === "es" ? "Fecha de vencimiento" : "Due date"}
          </label>
          <input
            type="date"
            name="due_date"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {lang === "es" ? "Moneda" : "Currency"}
          </label>
          <input
            type="text"
            name="currency"
            defaultValue="USD"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-950">
          {lang === "es" ? "Conceptos" : "Items"}
        </h2>

        <div className="mt-4 space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_120px_160px_auto]"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {lang === "es" ? "Descripción" : "Description"}
                </label>
                <input
                  type="text"
                  name="item_description"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {lang === "es" ? "Cant." : "Qty"}
                </label>
                <input
                  type="number"
                  name="item_quantity"
                  min={1}
                  step="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, "quantity", Number(e.target.value))
                  }
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {lang === "es" ? "Precio unitario" : "Unit price"}
                </label>
                <input
                  type="number"
                  name="item_unit_price"
                  min={0}
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) =>
                    updateItem(index, "unit_price", Number(e.target.value))
                  }
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="h-12 rounded-2xl border border-rose-200 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                >
                  {lang === "es" ? "Quitar" : "Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="mt-4 inline-flex rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {lang === "es" ? "+ Agregar concepto" : "+ Add item"}
        </button>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          {t.common.notes}
        </label>
        <textarea
          name="notes"
          rows={4}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
        />
      </div>

      <div className="ml-auto w-full max-w-md space-y-3">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <span className="text-sm text-slate-500">{t.common.subtotal}</span>
          <span className="font-semibold text-slate-950">
            {totals.subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <span className="text-sm text-slate-500">{t.common.tax}</span>
          <span className="font-semibold text-slate-950">
            {totals.tax.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-slate-950 px-5 py-4 text-white">
          <span className="text-sm">{t.common.total}</span>
          <span className="text-lg font-bold">{totals.total.toFixed(2)}</span>
        </div>
      </div>

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
      >
        {t.common.createInvoice}
      </button>
    </form>
  );
}