"use client";

import { useState } from "react";

export default function NewInvoiceScreen({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    issue_date: "",
    due_date: "",
    currency: "USD",
    subtotal: "",
    company_name: "Tadeo Invoices",
    company_email: "admin@tadeoinvoice.com",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/invoices/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: form.subtotal,
        total: form.subtotal,
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
      className="ui-card mt-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 md:p-8"
    >
      <input type="hidden" value={userId} readOnly />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-900">
            Nombre del cliente
          </label>
          <input
            name="client_name"
            value={form.client_name}
            onChange={handleChange}
            required
            placeholder="Ej: Thunder Bay Foods"
            className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-900">
            Correo del cliente
          </label>
          <input
            type="email"
            name="client_email"
            value={form.client_email}
            onChange={handleChange}
            required
            placeholder="cliente@email.com"
            className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-900">
            Fecha de emisión
          </label>
          <input
            type="date"
            name="issue_date"
            value={form.issue_date}
            onChange={handleChange}
            required
            className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-900">
            Fecha de vencimiento
          </label>
          <input
            type="date"
            name="due_date"
            value={form.due_date}
            onChange={handleChange}
            required
            className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-900">
            Moneda
          </label>
          <select
            name="currency"
            value={form.currency}
            onChange={handleChange}
            className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-900">
            Total
          </label>
          <input
            type="number"
            min="1"
            step="0.01"
            name="subtotal"
            value={form.subtotal}
            onChange={handleChange}
            required
            placeholder="0.00"
            className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-blue-100 bg-blue-50 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-900">Total estimado</p>
            <p className="mt-1 text-sm text-slate-500">
              La factura se guardará como borrador.
            </p>
          </div>

          <div className="text-right text-3xl font-black text-blue-600">
            ${Number(form.subtotal || 0).toFixed(2)}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-8 h-14 w-full rounded-2xl bg-blue-600 text-base font-extrabold text-white shadow-xl shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Guardando factura..." : "Guardar factura"}
      </button>
    </form>
  );
}