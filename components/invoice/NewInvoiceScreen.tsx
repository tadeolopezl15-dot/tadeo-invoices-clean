"use client";

import { useMemo, useState } from "react";

type Item = {
  description: string;
  quantity: string;
  unit_price: string;
};

export default function NewInvoiceScreen({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    issue_date: "",
    due_date: "",
    currency: "USD",
    company_name: "Tadeo Invoices",
    company_email: "admin@tadeoinvoice.com",
  });

  const [items, setItems] = useState<Item[]>([
    { description: "", quantity: "1", unit_price: "" },
  ]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + Number(item.quantity || 0) * Number(item.unit_price || 0);
    }, 0);
  }, [items]);

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function updateItem(index: number, field: keyof Item, value: string) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { description: "", quantity: "1", unit_price: "" },
    ]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/invoices/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        items,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Error al guardar factura");
      setLoading(false);
      return;
    }

    window.location.href = `/invoice/${data.invoiceId}`;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl md:p-10"
    >
      <input type="hidden" value={userId} readOnly />

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Nombre del cliente
          </label>
          <input
            name="client_name"
            value={form.client_name}
            onChange={handleFormChange}
            required
            placeholder="Ej: Thunder Bay Foods"
            className="input"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Correo del cliente
          </label>
          <input
            type="email"
            name="client_email"
            value={form.client_email}
            onChange={handleFormChange}
            required
            placeholder="cliente@email.com"
            className="input"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Fecha de emisión
          </label>
          <input
            type="date"
            name="issue_date"
            value={form.issue_date}
            onChange={handleFormChange}
            required
            className="input"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Fecha de vencimiento
          </label>
          <input
            type="date"
            name="due_date"
            value={form.due_date}
            onChange={handleFormChange}
            required
            className="input"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Moneda
          </label>
          <select
            name="currency"
            value={form.currency}
            onChange={handleFormChange}
            className="input"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-950">
              Desglose de materiales
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Agrega productos, materiales o servicios usados en la factura.
            </p>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white"
          >
            + Agregar
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => {
            const lineTotal =
              Number(item.quantity || 0) * Number(item.unit_price || 0);

            return (
              <div
                key={index}
                className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1.5fr_0.5fr_0.7fr_0.7fr_auto]"
              >
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Descripción
                  </label>
                  <input
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, "description", e.target.value)
                    }
                    required
                    placeholder="Ej: Cemento, cable, mano de obra..."
                    className="input bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Cant.
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", e.target.value)
                    }
                    required
                    className="input bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Precio
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) =>
                      updateItem(index, "unit_price", e.target.value)
                    }
                    required
                    placeholder="0.00"
                    className="input bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Total
                  </label>
                  <div className="flex h-14 items-center rounded-2xl border border-slate-200 bg-white px-4 font-black text-slate-950">
                    ${lineTotal.toFixed(2)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="self-end rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm font-bold text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Eliminar
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-blue-100 bg-blue-50 p-6">
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-slate-900">Subtotal</span>
          <span className="text-3xl font-black text-blue-600">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-blue-100 pt-3">
          <span className="text-base font-bold text-slate-900">Total</span>
          <span className="text-3xl font-black text-slate-950">
            ${subtotal.toFixed(2)}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-8 w-full rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar factura"}
      </button>

      <style jsx>{`
        .input {
          height: 56px;
          width: 100%;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          padding: 0 16px;
          font-size: 15px;
          font-weight: 500;
          color: #0f172a;
          outline: none;
          transition: all 0.2s;
        }

        .input:focus {
          border-color: #2563eb;
          background: white;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }
      `}</style>
    </form>
  );
}