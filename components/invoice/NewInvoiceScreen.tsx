"use client";

import { useState } from "react";

export default function NewInvoiceScreen({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    company_name: "Tadeo Invoices",
    company_email: "admin@tadeoinvoice.com",
    amount: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
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
      body: JSON.stringify(form),
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
    <form onSubmit={handleSubmit} className="ui-card mt-6 p-6 space-y-5">
      <input type="hidden" value={userId} readOnly />

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Nombre del cliente
        </label>
        <input
          type="text"
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
          Nombre de tu empresa
        </label>
        <input
          type="text"
          name="company_name"
          value={form.company_name}
          onChange={handleChange}
          required
          className="input"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Correo de tu empresa
        </label>
        <input
          type="email"
          name="company_email"
          value={form.company_email}
          onChange={handleChange}
          required
          className="input"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Monto
        </label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          required
          min="1"
          step="0.01"
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