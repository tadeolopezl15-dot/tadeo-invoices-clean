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
      headers: {
        "Content-Type": "application/json",
      },
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
    <form onSubmit={handleSubmit} className="ui-card mt-6 p-6 space-y-6">
      <input type="hidden" value={userId} readOnly />

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Nombre del cliente
        </label>
        <input
          name="client_name"
          value={form.client_name}
          onChange={handleChange}
          required
          className="input"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Correo del cliente
        </label>
        <input
          type="email"
          name="client_email"
          value={form.client_email}
          onChange={handleChange}
          required
          className="input"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Fecha de emisión
        </label>
        <input
          type="date"
          name="issue_date"
          value={form.issue_date}
          onChange={handleChange}
          required
          className="input"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Fecha de vencimiento
        </label>
        <input
          type="date"
          name="due_date"
          value={form.due_date}
          onChange={handleChange}
          required
          className="input"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Moneda
        </label>
        <select
          name="currency"
          value={form.currency}
          onChange={handleChange}
          className="input"
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
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
          className="input"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full"
      >
        {loading ? "Guardando..." : "Guardar factura"}
      </button>
    </form>
  );
}