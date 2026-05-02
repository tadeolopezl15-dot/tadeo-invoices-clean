"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Item = {
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

function token() {
  return crypto.randomUUID();
}

export default function NewInvoicePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now()}`);
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState(0);

  const [items, setItems] = useState<Item[]>([
    { description: "", quantity: 1, unit_price: 0 },
  ]);

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_price || 0),
      0
    );
  }, [items]);

  const taxTotal = useMemo(() => {
    return subtotal * (Number(taxRate || 0) / 100);
  }, [subtotal, taxRate]);

  const total = subtotal + taxTotal;

  function updateItem(index: number, key: keyof Item, value: string) {
    setItems((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              [key]:
                key === "description"
                  ? value
                  : Number(value) < 0
                    ? 0
                    : Number(value),
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

  function removeItem(index: number) {
    setItems((current) => current.filter((_, i) => i !== index));
  }

  async function insertItems(invoiceId: string) {
    const cleanItems = items
      .filter((item) => item.description.trim())
      .map((item) => ({
        invoice_id: invoiceId,
        description: item.description.trim(),
        quantity: Number(item.quantity || 0),
        unit_price: Number(item.unit_price || 0),
        line_total: Number(item.quantity || 0) * Number(item.unit_price || 0),
      }));

    if (cleanItems.length === 0) return;

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(cleanItems);

    if (!itemsError) return;

    const fallbackItems = cleanItems.map((item) => ({
      invoice_id: item.invoice_id,
      description: item.description,
      qty: item.quantity,
      price: item.unit_price,
      line_total: item.line_total,
    }));

    const { error: fallbackError } = await supabase
      .from("invoice_items")
      .insert(fallbackItems);

    if (fallbackError) {
      throw new Error("Failed to save items.");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("You are not logged in.");

      if (!companyName.trim()) throw new Error("Enter your company name.");
      if (!companyEmail.trim()) throw new Error("Enter your company email.");
      if (!clientName.trim()) throw new Error("Enter client name.");
      if (!invoiceNumber.trim()) throw new Error("Missing invoice number.");

      const invoicePayload = {
        user_id: user.id,
        company_name: companyName.trim(),
        company_email: companyEmail.trim(),
        client_name: clientName.trim(),
        client_email: clientEmail.trim(),
        invoice_number: invoiceNumber.trim(),
        issue_date: issueDate,
        due_date: dueDate || null,
        currency: "USD",
        status: "pending",
        notes: notes.trim(),
        subtotal,
        tax_total: taxTotal,
        total,
        public_token: token(),
      };

      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert(invoicePayload)
        .select("id")
        .single();

      if (invoiceError || !invoice) {
        throw new Error("Failed to create invoice.");
      }

      await insertItems(invoice.id);

      router.push(`/invoice/${invoice.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Error creating invoice.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <p className="text-cyan-300">Tadeo Invoices</p>
          <h1 className="text-3xl font-bold mt-2">Create New Invoice</h1>
          <p className="text-slate-400 mt-2">
            Fill in details, add products or services, and save your invoice.
          </p>
        </div>

        {error && (
          <div className="mb-6 text-red-400">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">

          {/* LEFT */}
          <section className="space-y-6">

            <div className="p-6 bg-white/[0.04] rounded-3xl">
              <h2 className="mb-4 font-bold">Main Details</h2>

              <input placeholder="Company Name" onChange={(e)=>setCompanyName(e.target.value)} className="input"/>
              <input placeholder="Company Email" onChange={(e)=>setCompanyEmail(e.target.value)} className="input"/>
              <input placeholder="Client Name" onChange={(e)=>setClientName(e.target.value)} className="input"/>
              <input placeholder="Client Email" onChange={(e)=>setClientEmail(e.target.value)} className="input"/>
            </div>

            <div className="p-6 bg-white/[0.04] rounded-3xl">
              <h2 className="mb-4 font-bold">Items</h2>

              {items.map((item, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input placeholder="Description" onChange={(e)=>updateItem(i,"description",e.target.value)} className="input"/>
                  <input type="number" onChange={(e)=>updateItem(i,"quantity",e.target.value)} className="input"/>
                  <input type="number" onChange={(e)=>updateItem(i,"unit_price",e.target.value)} className="input"/>
                </div>
              ))}

              <button type="button" onClick={addItem}>+ Add</button>
            </div>

          </section>

          {/* RIGHT */}
          <aside className="p-6 bg-white/[0.04] rounded-3xl">
            <h2 className="font-bold mb-4">Summary</h2>

            <p>Subtotal: {money(subtotal)}</p>
            <p>Tax: {money(taxTotal)}</p>
            <p>Total: {money(total)}</p>

            <button className="mt-6 w-full bg-cyan-400 text-black p-3 rounded-xl">
              {loading ? "Saving..." : "Create Invoice"}
            </button>

          </aside>

        </form>
      </div>
    </main>
  );
}