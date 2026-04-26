"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function NewInvoiceScreen({ userId }: { userId: string }) {
  const supabase = createClient();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    company_name: "",
    company_email: "",
    amount: "",
  });

  function handleChange(e: any) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    console.log("SUBMIT CLICKED"); // 🔥 IMPORTANTE

    setLoading(true);

    const subtotal = Number(form.amount || 0);
    const total = subtotal;

    const { data, error } = await supabase.from("invoices").insert([
      {
        user_id: userId,
        invoice_number: `INV-${Date.now()}`,
        client_name: form.client_name,
        client_email: form.client_email,
        company_name: form.company_name,
        company_email: form.company_email,
        issue_date: new Date().toISOString(),
        due_date: new Date().toISOString(),
        currency: "USD",
        subtotal,
        total,
        status: "draft",
      },
    ]);

    console.log("INSERT RESULT:", { data, error }); // 🔥

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    alert("Factura creada");
    window.location.href = "/invoice";
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white rounded-xl">
      <input
        name="client_name"
        placeholder="Cliente"
        onChange={handleChange}
        required
        className="input"
      />

      <input
        name="client_email"
        placeholder="Email cliente"
        onChange={handleChange}
        required
        className="input"
      />

      <input
        name="company_name"
        placeholder="Tu empresa"
        onChange={handleChange}
        required
        className="input"
      />

      <input
        name="company_email"
        placeholder="Email empresa"
        onChange={handleChange}
        required
        className="input"
      />

      <input
        name="amount"
        placeholder="Monto"
        type="number"
        onChange={handleChange}
        required
        className="input"
      />

      <button type="submit" className="btn btn-primary w-full">
        {loading ? "Guardando..." : "Crear factura"}
      </button>
    </form>
  );
}