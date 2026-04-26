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

  function handleChange(e: any) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: any) {
    e.preventDefault(); // 🔥 ESTO ES CLAVE

    console.log("SUBMIT FUNCIONA");

    setLoading(true);

    const res = await fetch("/api/invoices/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    console.log("RESPUESTA:", data);

    if (!res.ok) {
      alert(data.error || "Error al guardar");
      setLoading(false);
      return;
    }

    alert("Factura creada");
    window.location.href = `/invoice/${data.invoiceId}`;
  }

  return (
    <form
      onSubmit={handleSubmit} // 🔥 OBLIGATORIO
      method="POST" // 🔥 evita GET
      className="ui-card mt-6 p-6 space-y-5"
    >
      <div>
        <label>Nombre del cliente</label>
        <input
          name="client_name"
          value={form.client_name}
          onChange={handleChange}
          required
          className="input"
        />
      </div>

      <div>
        <label>Correo del cliente</label>
        <input
          name="client_email"
          type="email"
          value={form.client_email}
          onChange={handleChange}
          required
          className="input"
        />
      </div>

      <div>
        <label>Nombre de tu empresa</label>
        <input
          name="company_name"
          value={form.company_name}
          onChange={handleChange}
          required
          className="input"
        />
      </div>

      <div>
        <label>Correo de tu empresa</label>
        <input
          name="company_email"
          type="email"
          value={form.company_email}
          onChange={handleChange}
          required
          className="input"
        />
      </div>

      <div>
        <label>Monto</label>
        <input
          name="amount"
          type="number"
          value={form.amount}
          onChange={handleChange}
          required
          className="input"
        />
      </div>

      <button type="submit" className="btn btn-primary w-full">
        {loading ? "Guardando..." : "Guardar factura"}
      </button>
    </form>
  );
}