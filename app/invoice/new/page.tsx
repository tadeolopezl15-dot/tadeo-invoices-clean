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
  }).format(Number(value || 0));
}

function generateToken() {
  return crypto.randomUUID();
}

export default function NewInvoicePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
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
      (sum, item) =>
        sum + Number(item.quantity || 0) * Number(item.unit_price || 0),
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
      console.error("ITEMS_ERROR:", fallbackError);
      throw new Error(
        fallbackError.message || "Failed to save invoice items."
      );
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You are not logged in. Please sign in again.");
      }

      if (!companyName.trim()) throw new Error("Enter your company name.");
      if (!companyEmail.trim()) throw new Error("Enter your company email.");
      if (!clientName.trim()) throw new Error("Enter the client name.");
      if (!invoiceNumber.trim()) throw new Error("Invoice number is required.");

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
        public_token: generateToken(),
      };

      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert(invoicePayload)
        .select("id")
        .single();

      if (invoiceError || !invoice) {
        console.error("INVOICE_ERROR:", invoiceError);
        throw new Error(
          invoiceError?.message ||
            invoiceError?.details ||
            "Failed to create invoice."
        );
      }

      await insertItems(invoice.id);

      router.push(`/invoice/${invoice.id}`);
      router.refresh();
    } catch (err: any) {
      console.error("CREATE_INVOICE_ERROR:", err);
      setError(err?.message || "Error creating invoice.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <section className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 shadow-2xl">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-24 left-8 h-72 w-72 rounded-full bg-blue-700/25 blur-3xl" />

          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
                Tadeo Invoices
              </p>
              <h1 className="mt-4 text-5xl font-black tracking-tight md:text-6xl">
                Create Invoice
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-slate-300">
                Build a polished invoice, add line items, calculate totals, and
                send it to your client with a professional payment-ready workflow.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/invoice")}
              className="rounded-2xl border border-white/10 px-5 py-3 text-center font-black text-white hover:bg-white/10"
            >
              Back to Invoices
            </button>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold text-red-200">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[1fr_380px]"
        >
          <section className="space-y-6">
            <Panel title="Business & Client Details">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Company Name">
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="input"
                    placeholder="Tadeo Invoices LLC"
                  />
                </Field>

                <Field label="Company Email">
                  <input
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="input"
                    placeholder="billing@tadeoinvoice.com"
                    type="email"
                  />
                </Field>

                <Field label="Client Name">
                  <input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="input"
                    placeholder="Client or business name"
                  />
                </Field>

                <Field label="Client Email">
                  <input
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="input"
                    placeholder="client@email.com"
                    type="email"
                  />
                </Field>
              </div>
            </Panel>

            <Panel title="Invoice Information">
              <div className="grid gap-4 md:grid-cols-4">
                <Field label="Invoice Number">
                  <input
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="input"
                  />
                </Field>

                <Field label="Issue Date">
                  <input
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="input"
                    type="date"
                  />
                </Field>

                <Field label="Due Date">
                  <input
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="input"
                    type="date"
                  />
                </Field>

                <Field label="Tax Rate %">
                  <input
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                  />
                </Field>
              </div>
            </Panel>

            <Panel title="Products & Services">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-slate-400">
                  Add billable items, service lines, labor, materials, or custom
                  charges.
                </p>

                <button
                  type="button"
                  onClick={addItem}
                  className="rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950 hover:bg-cyan-300"
                >
                  + Add Line Item
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 md:grid-cols-[1fr_110px_140px_130px]"
                  >
                    <Field label="Description">
                      <input
                        value={item.description}
                        onChange={(e) =>
                          updateItem(index, "description", e.target.value)
                        }
                        className="input"
                        placeholder="Service, product, or project work"
                      />
                    </Field>

                    <Field label="Qty">
                      <input
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", e.target.value)
                        }
                        className="input"
                        type="number"
                        min="0"
                        step="1"
                      />
                    </Field>

                    <Field label="Unit Price">
                      <input
                        value={item.unit_price}
                        onChange={(e) =>
                          updateItem(index, "unit_price", e.target.value)
                        }
                        className="input"
                        type="number"
                        min="0"
                        step="0.01"
                      />
                    </Field>

                    <div className="flex flex-col justify-end">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                        Line Total
                      </p>

                      <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                        <span className="font-black text-cyan-300">
                          {money(item.quantity * item.unit_price)}
                        </span>

                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-xs font-bold text-red-300 hover:text-red-200"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Notes">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input min-h-[140px] resize-none"
                placeholder="Payment terms, thank-you note, project details, or client instructions..."
              />
            </Panel>
          </section>

          <aside className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl lg:sticky lg:top-6">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
              Invoice Summary
            </p>

            <h2 className="mt-3 text-3xl font-black">Ready to Send</h2>

            <p className="mt-2 text-sm text-slate-400">
              Review totals before creating this invoice.
            </p>

            <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
              <SummaryRow label="Subtotal" value={money(subtotal)} />
              <SummaryRow label={`Tax (${taxRate}%)`} value={money(taxTotal)} />
              <div className="h-px bg-white/10" />
              <SummaryRow label="Total" value={money(total)} strong />
            </div>

            <button
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-cyan-400 px-5 py-4 font-black text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Invoice..." : "Create Invoice"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/invoice")}
              className="mt-3 w-full rounded-2xl border border-white/10 px-5 py-4 font-black text-white hover:bg-white/10"
            >
              Cancel
            </button>

            <div className="mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <p className="text-sm font-black text-cyan-300">
                Pro Workflow
              </p>
              <p className="mt-1 text-sm text-slate-300">
                After creation, you can open the invoice, generate PDF, email it
                to your client, or collect payment through Stripe.
              </p>
            </div>
          </aside>
        </form>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(15, 23, 42, 0.75);
          padding: 0.9rem 1rem;
          color: white;
          outline: none;
        }

        .input:focus {
          border-color: rgba(34, 211, 238, 0.7);
          box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.1);
        }

        .input::placeholder {
          color: rgb(100, 116, 139);
        }
      `}</style>
    </main>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
      <h2 className="mb-5 text-xl font-black">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? "text-lg font-black" : "text-slate-400"}>
        {label}
      </span>
      <span
        className={
          strong
            ? "text-3xl font-black text-cyan-300"
            : "font-black text-white"
        }
      >
        {value}
      </span>
    </div>
  );
}