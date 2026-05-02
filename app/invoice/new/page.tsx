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
      console.error("ITEMS_ERROR:", fallbackError);
      throw new Error(
        fallbackError.message || "No se pudieron guardar los productos."
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
        throw new Error("No estás logueado. Entra otra vez a tu cuenta.");
      }

      if (!companyName.trim()) throw new Error("Escribe el nombre de tu compañía.");
      if (!companyEmail.trim()) throw new Error("Escribe el email de tu compañía.");
      if (!clientName.trim()) throw new Error("Escribe el nombre del cliente.");
      if (!invoiceNumber.trim()) throw new Error("Falta el número de factura.");

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
        console.error("INVOICE_ERROR:", invoiceError);
        throw new Error(
          invoiceError?.message ||
            invoiceError?.details ||
            "No se pudo crear la factura."
        );
      }

      await insertItems(invoice.id);

      router.push(`/invoice/${invoice.id}`);
      router.refresh();
    } catch (err: any) {
      console.error("CREATE_INVOICE_ERROR:", err);
      setError(err?.message || "Error creando la factura.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
          <p className="text-sm font-semibold text-cyan-300">Tadeo Invoices</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Crear nueva factura
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Completa los datos, agrega productos o servicios y guarda la factura.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="mb-5 text-xl font-semibold">Datos principales</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nombre de tu compañía">
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="input"
                    placeholder="Tadeo Invoices LLC"
                  />
                </Field>

                <Field label="Email de tu compañía">
                  <input
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="input"
                    placeholder="billing@tadeoinvoice.com"
                    type="email"
                  />
                </Field>

                <Field label="Cliente">
                  <input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="input"
                    placeholder="Nombre del cliente"
                  />
                </Field>

                <Field label="Email del cliente">
                  <input
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="input"
                    placeholder="cliente@email.com"
                    type="email"
                  />
                </Field>

                <Field label="Número de factura">
                  <input
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="input"
                  />
                </Field>

                <Field label="Fecha de emisión">
                  <input
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="input"
                    type="date"
                  />
                </Field>

                <Field label="Fecha de vencimiento">
                  <input
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="input"
                    type="date"
                  />
                </Field>

                <Field label="Tax %">
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
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Productos / servicios</h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300"
                >
                  + Agregar
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4 md:grid-cols-[1fr_100px_130px_100px]"
                  >
                    <Field label="Descripción">
                      <input
                        value={item.description}
                        onChange={(e) =>
                          updateItem(index, "description", e.target.value)
                        }
                        className="input"
                        placeholder="Servicio, producto o trabajo"
                      />
                    </Field>

                    <Field label="Cantidad">
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

                    <Field label="Precio">
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
                      <p className="mb-2 text-xs text-slate-400">Total</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold">
                          {money(item.quantity * item.unit_price)}
                        </span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-sm text-red-300 hover:text-red-200"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <Field label="Notas">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input min-h-[120px] resize-none"
                  placeholder="Gracias por su negocio..."
                />
              </Field>
            </div>
          </section>

          <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-semibold">Resumen</h2>

            <div className="mt-6 space-y-4 text-sm">
              <Row label="Subtotal" value={money(subtotal)} />
              <Row label={`Tax ${taxRate}%`} value={money(taxTotal)} />
              <div className="h-px bg-white/10" />
              <Row label="Total" value={money(total)} strong />
            </div>

            <button
              disabled={loading}
              className="mt-8 w-full rounded-2xl bg-cyan-400 px-5 py-4 font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Crear factura"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/invoice")}
              className="mt-3 w-full rounded-2xl border border-white/10 px-5 py-4 font-semibold text-white hover:bg-white/10"
            >
              Cancelar
            </button>
          </aside>
        </form>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(15, 23, 42, 0.75);
          padding: 0.85rem 1rem;
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function Row({
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
      <span className={strong ? "text-lg font-bold" : "text-slate-400"}>
        {label}
      </span>
      <span className={strong ? "text-2xl font-black text-cyan-300" : "font-semibold"}>
        {value}
      </span>
    </div>
  );
}