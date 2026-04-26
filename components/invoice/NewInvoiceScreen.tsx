"use client";

import { useState } from "react";

export default function NewInvoiceScreen({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    company_name: "",
    company_email: "",
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

    console.log("SUBMIT CLICKED", { userId, form });

    const res = await fetch("/api/invoices/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    console.log("CREATE INVOICE RESPONSE", data);

    if (!res.ok) {
      alert(data.error || "Error al guardar factura");
      setLoading(false);
      return;
    }

    alert("Factura creada correctamente");
    window.location.href = `/invoice/${data.invoiceId}`;
  }

  return (
    <form onSubmit={handleSubmit} className="ui-card p-6 space-y-4">
      <h2 className="text-2xl font-black text-slate-950">Nueva factura</h2>

      <input
        name="client_name"
        placeholder="Nombre del cliente"
        value={form.client_name}
        onChange={handleChange}
        required
        className="input"
      />

      <input
        name="client_email"
        type="email"
        placeholder="Email del cliente"
        value={form.client_email}
        onChange={handleChange}
        required
        className="input"
      />

      <input
        name="company_name"
        placeholder="Nombre de tu empresa"
        value={form.company_name}
        onChange={handleChange}
        required
        className="input"
      />

      <input
        name="company_email"
        type="email"
        placeholder="Email de tu empresa"
        value={form.company_email}
        onChange={handleChange}
        required
        className="input"
      />

      <input
        name="amount"
        type="number"
        min="1"
        step="0.01"
        placeholder="Monto"
        value={form.amount}
        onChange={handleChange}
        required
        className="input"
      />

      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? "Guardando..." : "Crear factura"}
      </button>
    </form>
  );
}