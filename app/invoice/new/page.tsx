"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";

type Item = {
  description: string;
  qty: number;
  unit_price: number;
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}

function createInvoiceNumber() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `INV-${y}${m}${d}-${random}`;
}

export default function NewInvoicePage() {
  const router = useRouter();

  const [invoiceNumber, setInvoiceNumber] = useState(createInvoiceNumber());
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [taxRate, setTaxRate] = useState(0);
  const [items, setItems] = useState<Item[]>([
    { description: "", qty: 1, unit_price: 0 },
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + Number(item.qty || 0) * Number(item.unit_price || 0);
    }, 0);
  }, [items]);

  const taxTotal = useMemo(() => {
    return subtotal * (Number(taxRate || 0) / 100);
  }, [subtotal, taxRate]);

  const total = subtotal + taxTotal;

  function updateItem(index: number, field: keyof Item, value: string) {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        if (field === "description") {
          return { ...item, description: value };
        }

        return {
          ...item,
          [field]: Number(value || 0),
        };
      })
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      { description: "", qty: 1, unit_price: 0 },
    ]);
  }

  function removeItem(index: number) {
    setItems((current) => {
      if (current.length === 1) return current;
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setLoading(true);

    try {
      const supabase = createBrowserClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be logged in to create an invoice.");
      }

      const cleanItems = items
        .filter((item) => item.description.trim())
        .map((item) => ({
          description: item.description.trim(),
          qty: Number(item.qty || 0),
          unit_price: Number(item.unit_price || 0),
          line_total: Number(item.qty || 0) * Number(item.unit_price || 0),
        }));

      if (!companyName.trim()) {
        throw new Error("Client or company name is required.");
      }

      if (!companyEmail.trim()) {
        throw new Error("Client email is required.");
      }

      if (!cleanItems.length) {
        throw new Error("Add at least one invoice item.");
      }

      const publicToken =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          user_id: user.id,
          invoice_number: invoiceNumber,
          company_name: companyName.trim(),
          company_email: companyEmail.trim(),
          issue_date: issueDate,
          public_token: publicToken,
          currency: "USD",
          subtotal,
          tax_total: taxTotal,
          total,
          status: "pending",
        })
        .select("id")
        .single();

      if (invoiceError || !invoice) {
        throw invoiceError || new Error("Invoice could not be created.");
      }

      const itemsToInsert = cleanItems.map((item) => ({
        invoice_id: invoice.id,
        description: item.description,
        qty: item.qty,
        unit_price: item.unit_price,
        line_total: item.line_total,
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(itemsToInsert);

      if (itemsError) {
        throw itemsError;
      }

      router.push(`/invoice/${invoice.id}`);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the invoice."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/invoice"
              className="text-sm font-semibold text-blue-300 hover:text-blue-200"
            >
              ← Back to invoices
            </Link>

            <h1 className="mt-4 text-4xl font-black tracking-tight">
              Create Invoice
            </h1>

            <p className="mt-2 text-slate-400">
              Create a professional invoice and send it to your client.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Total
            </p>
            <p className="mt-1 text-3xl font-black">{money(total)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-12">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 lg:col-span-8">
            <h2 className="text-xl font-black">Invoice Details</h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-bold text-slate-300">
                  Invoice Number
                </label>
                <input
                  value={invoiceNumber}
                  onChange={(event) => setInvoiceNumber(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:ring-4 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-300">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(event) => setIssueDate(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:ring-4 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-300">
                  Client / Company Name
                </label>
                <input
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  placeholder="Acme Corporation"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:ring-4 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-300">
                  Client Email
                </label>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(event) => setCompanyEmail(event.target.value)}
                  placeholder="client@example.com"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:ring-4 focus:ring-blue-500/30"
                />
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black">Items</h2>

                <button
                  type="button"
                  onClick={addItem}
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/15"
                >
                  + Add Item
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="grid gap-4 rounded-3xl border border-white/10 bg-black/20 p-4 md:grid-cols-12 md:items-end"
                  >
                    <div className="md:col-span-6">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Description
                      </label>
                      <input
                        value={item.description}
                        onChange={(event) =>
                          updateItem(index, "description", event.target.value)
                        }
                        placeholder="Product or service"
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:ring-4 focus:ring-blue-500/30"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.qty}
                        onChange={(event) =>
                          updateItem(index, "qty", event.target.value)
                        }
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:ring-4 focus:ring-blue-500/30"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Unit Price
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(event) =>
                          updateItem(index, "unit_price", event.target.value)
                        }
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:ring-4 focus:ring-blue-500/30"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Total
                      </p>
                      <p className="mt-3 font-black">
                        {money(
                          Number(item.qty || 0) * Number(item.unit_price || 0)
                        )}
                      </p>
                    </div>

                    <div className="md:col-span-1">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="w-full rounded-2xl border border-red-400/20 bg-red-500/10 px-3 py-3 text-sm font-bold text-red-200 hover:bg-red-500/20"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 lg:col-span-4">
            <h2 className="text-xl font-black">Summary</h2>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between border-b border-white/10 pb-4">
                <span className="text-slate-400">Subtotal</span>
                <span className="font-bold">{money(subtotal)}</span>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-300">
                  Tax Rate %
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={taxRate}
                  onChange={(event) => setTaxRate(Number(event.target.value))}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:ring-4 focus:ring-blue-500/30"
                />
              </div>

              <div className="flex justify-between border-b border-white/10 pb-4">
                <span className="text-slate-400">Tax</span>
                <span className="font-bold">{money(taxTotal)}</span>
              </div>

              <div className="flex justify-between text-2xl font-black">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
            </div>

            {errorMessage ? (
              <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-blue-500 px-5 py-4 font-black text-white shadow-xl shadow-blue-500/25 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Invoice..." : "Create Invoice"}
            </button>

            <Link
              href="/invoice"
              className="mt-3 flex w-full justify-center rounded-2xl border border-white/10 px-5 py-4 font-bold text-slate-300 transition hover:bg-white/10"
            >
              Cancel
            </Link>
          </aside>
        </form>
      </div>
    </main>
  );
}