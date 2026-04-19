"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import type { InvoiceItem, Profile } from "@/lib/types";

const initialItems: InvoiceItem[] = [
  { description: "Servicio principal", quantity: 1, unit_price: 250 },
];

type Props = {
  profile?: Profile | null;
};

export function InvoiceForm({ profile }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [companyName, setCompanyName] = useState(
    profile?.company_name || "Tadeo Billing & Invoices"
  );
  const [companyEmail, setCompanyEmail] = useState(
    profile?.company_email || "contacto@tadeobilling.com"
  );
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(
    `INV-${Date.now().toString().slice(-6)}`
  );
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("Gracias por su preferencia.");
  const [items, setItems] = useState<InvoiceItem[]>(initialItems);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0),
    [items]
  );

  const tax = useMemo(() => subtotal * 0.07, [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  function updateItem(index: number, key: keyof InvoiceItem, value: string) {
    setItems((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              [key]: key === "description" ? value : Number(value),
            }
          : item
      )
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      { description: "", quantity: 1, unit_price: 0 },
    ]);
  }

  async function saveInvoice(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const supabase = createBrowserSupabaseClient();
    const { data: sessionData } = await supabase.auth.getSession();

    const user = sessionData.session?.user;
    if (!user) {
      router.push("/login");
      return;
    }

    const payload = {
      user_id: user.id,
      invoice_number: invoiceNumber,
      company_name: companyName,
      company_email: companyEmail,
      client_name: clientName,
      client_email: clientEmail,
      issue_date: issueDate,
      due_date: dueDate,
      status: "draft",
      currency: "USD",
      notes,
      subtotal,
      tax,
      total,
      public_token: crypto.randomUUID(),
      items,
    };

    const { error } = await supabase.from("invoices").insert(payload);

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <form className="form-grid" onSubmit={saveInvoice}>
      <div className="card">
        <h2>Nueva factura</h2>
        <p className="muted">Completa los datos y guárdala en tu panel.</p>

        <div className="grid-two">
          <label>
            <span>Empresa</span>
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
          </label>

          <label>
            <span>Email empresa</span>
            <input value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} required />
          </label>

          <label>
            <span>Cliente</span>
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} required />
          </label>

          <label>
            <span>Email cliente</span>
            <input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} required />
          </label>

          <label>
            <span>Número de factura</span>
            <input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} required />
          </label>

          <label>
            <span>Fecha de emisión</span>
            <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
          </label>

          <label>
            <span>Fecha de vencimiento</span>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          </label>
        </div>

        <label>
          <span>Notas</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
        </label>
      </div>

      <div className="card">
        <div className="row-between">
          <h2>Conceptos</h2>
          <button type="button" className="ghost-btn" onClick={addItem}>
            Agregar línea
          </button>
        </div>

        <div className="items-list">
          {items.map((item, index) => (
            <div key={index} className="item-row">
              <input
                placeholder="Descripción"
                value={item.description}
                onChange={(e) => updateItem(index, "description", e.target.value)}
                required
              />
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Cantidad"
                value={item.quantity}
                onChange={(e) => updateItem(index, "quantity", e.target.value)}
                required
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Precio"
                value={item.unit_price}
                onChange={(e) => updateItem(index, "unit_price", e.target.value)}
                required
              />
            </div>
          ))}
        </div>
      </div>

      <div className="card summary-card">
        <h2>Resumen</h2>
        <div className="summary-row"><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
        <div className="summary-row"><span>Tax 7%</span><strong>${tax.toFixed(2)}</strong></div>
        <div className="summary-row total"><span>Total</span><strong>${total.toFixed(2)}</strong></div>

        <button type="submit" className="blue-btn" disabled={saving}>
          {saving ? "Guardando..." : "Guardar factura"}
        </button>
      </div>
    </form>
  );
}