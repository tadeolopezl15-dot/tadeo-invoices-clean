"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PayInvoiceButton from "./PayInvoiceButton";
import DeleteInvoiceButton from "./DeleteInvoiceButton";

type Lang = "es" | "en";

type InvoiceItem = {
  id?: string;
  description?: string;
  quantity?: number;
  unit_price?: number;
  unitPrice?: number;
  total?: number;
};

type InvoiceDetailScreenProps = {
  invoice: {
    id: string;
    invoice_number?: string;
    number?: string;
    status?: string;
    client_name?: string;
    client_email?: string;
    created_at?: string;
    issue_date?: string;
    due_date?: string;
    currency?: string;
    total?: number;
    subtotal?: number;
    tax?: number;
    notes?: string;
    items?: InvoiceItem[];
  };
  paymentSuccess?: boolean;
  paymentCanceled?: boolean;
};

const copy = {
  es: {
    back: "Volver",
    edit: "Editar",
    downloadPdf: "PDF",
    paid: "Pagada",
    pending: "Pendiente",
    overdue: "Vencida",
    draft: "Borrador",
    client: "Cliente",
    email: "Correo",
    date: "Fecha",
    issueDate: "Emisión",
    dueDate: "Vencimiento",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Impuesto",
    items: "Conceptos",
    notes: "Notas",
    noItems: "No hay conceptos en esta factura.",
    paymentSuccess: "Pago recibido correctamente.",
    paymentCanceled: "El pago fue cancelado.",
    invoice: "Factura",
    summary: "Resumen",
    status: "Estado",
    delete: "Eliminar",
  },
  en: {
    back: "Back",
    edit: "Edit",
    downloadPdf: "PDF",
    paid: "Paid",
    pending: "Pending",
    overdue: "Overdue",
    draft: "Draft",
    client: "Client",
    email: "Email",
    date: "Date",
    issueDate: "Issue date",
    dueDate: "Due date",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Tax",
    items: "Items",
    notes: "Notes",
    noItems: "There are no items in this invoice.",
    paymentSuccess: "Payment received successfully.",
    paymentCanceled: "The payment was canceled.",
    invoice: "Invoice",
    summary: "Summary",
    status: "Status",
    delete: "Delete",
  },
} as const;

export default function InvoiceDetailScreen({
  invoice,
  paymentSuccess = false,
  paymentCanceled = false,
}: InvoiceDetailScreenProps) {
  const [lang, setLang] = useState<Lang>("es");

  useEffect(() => {
    const syncLang = () => {
      const saved = localStorage.getItem("app_lang") as Lang | null;
      if (saved === "en" || saved === "es") {
        setLang(saved);
      } else {
        setLang("es");
      }
    };

    syncLang();
    window.addEventListener("storage", syncLang);
    window.addEventListener("app-language-changed", syncLang as EventListener);

    return () => {
      window.removeEventListener("storage", syncLang);
      window.removeEventListener(
        "app-language-changed",
        syncLang as EventListener
      );
    };
  }, []);

  const t = useMemo(() => copy[lang], [lang]);

  const invoiceNumber =
    invoice.invoice_number ||
    invoice.number ||
    `INV-${String(invoice.id).slice(0, 8).toUpperCase()}`;

  const items = invoice.items || [];
  const currency = invoice.currency || "USD";

  const subtotal =
    typeof invoice.subtotal === "number"
      ? invoice.subtotal
      : items.reduce((sum, item) => {
          const qty = Number(item.quantity || 0);
          const price = Number(item.unit_price ?? item.unitPrice ?? 0);
          return sum + qty * price;
        }, 0);

  const tax = Number(invoice.tax || 0);
  const total =
    typeof invoice.total === "number" ? invoice.total : subtotal + tax;

  const money = (value: number) =>
    new Intl.NumberFormat(lang === "es" ? "es-US" : "en-US", {
      style: "currency",
      currency,
    }).format(value || 0);

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString(lang === "es" ? "es-US" : "en-US");
  };

  const status = String(invoice.status || "pending").toLowerCase();

  const statusLabel =
    status === "paid"
      ? t.paid
      : status === "overdue"
      ? t.overdue
      : status === "draft"
      ? t.draft
      : t.pending;

  const statusClasses =
    status === "paid"
      ? "bg-green-500/20 text-green-300 border-green-400/20"
      : status === "overdue"
      ? "bg-red-500/20 text-red-300 border-red-400/20"
      : status === "draft"
      ? "bg-amber-500/20 text-amber-300 border-amber-400/20"
      : "bg-yellow-500/20 text-yellow-300 border-yellow-400/20";

  return (
    <main className="min-h-screen bg-[#020617] p-6 text-white">
      <div className="mx-auto max-w-6xl">
        {paymentSuccess ? (
          <div className="mb-6 rounded-2xl border border-green-400/20 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-300">
            {t.paymentSuccess}
          </div>
        ) : null}

        {paymentCanceled ? (
          <div className="mb-6 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 px-4 py-3 text-sm font-medium text-yellow-300">
            {t.paymentCanceled}
          </div>
        ) : null}

        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">
              {t.invoice}
            </p>
            <h1 className="mt-2 text-3xl font-semibold">#{invoiceNumber}</h1>
            <p className="mt-2 text-white/60">
              {t.date}: {formatDate(invoice.issue_date || invoice.created_at)}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-medium hover:bg-white/10"
            >
              {t.back}
            </Link>

            <Link
              href={`/invoice/${invoice.id}/edit`}
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-medium hover:bg-white/10"
            >
              {t.edit}
            </Link>

            <a
              href={`/api/invoices/${invoice.id}/pdf`}
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-medium hover:bg-white/10"
            >
              {t.downloadPdf}
            </a>

            {status !== "paid" ? (
              <div className="min-w-[200px]">
                <PayInvoiceButton invoiceId={invoice.id} />
              </div>
            ) : null}

            <DeleteInvoiceButton invoiceId={invoice.id} />
          </div>
        </div>

        <div className="mb-6">
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${statusClasses}`}
          >
            {t.status}: {statusLabel}
          </span>
        </div>

        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/60">{t.client}</p>
            <p className="mt-1 text-lg font-semibold">
              {invoice.client_name || "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/60">{t.email}</p>
            <p className="mt-1 text-lg font-semibold">
              {invoice.client_email || "-"}
            </p>
          </div>
        </div>

        <div className="mb-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/60">{t.issueDate}</p>
            <p className="mt-1 text-lg font-semibold">
              {formatDate(invoice.issue_date || invoice.created_at)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/60">{t.dueDate}</p>
            <p className="mt-1 text-lg font-semibold">
              {formatDate(invoice.due_date)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/60">{t.total}</p>
            <p className="mt-1 text-2xl font-bold">{money(total)}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t.items}</h2>
            <span className="text-sm text-white/50">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>

          {items.length > 0 ? (
            <div className="space-y-3">
              {items.map((item, i) => {
                const qty = Number(item.quantity || 0);
                const unitPrice = Number(item.unit_price ?? item.unitPrice ?? 0);
                const lineTotal =
                  typeof item.total === "number" ? item.total : qty * unitPrice;

                return (
                  <div
                    key={item.id || i}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {item.description || `Item ${i + 1}`}
                      </p>
                      <p className="mt-1 text-sm text-white/50">
                        {qty} × {money(unitPrice)}
                      </p>
                    </div>

                    <p className="text-lg font-semibold">{money(lineTotal)}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-white/60">{t.noItems}</p>
          )}

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm text-white/60">{t.notes}</p>
              <p className="mt-2 whitespace-pre-wrap text-white/85">
                {invoice.notes || "-"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="mb-4 text-sm text-white/60">{t.summary}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-white/80">
                  <span>{t.subtotal}</span>
                  <span>{money(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-white/80">
                  <span>{t.tax}</span>
                  <span>{money(tax)}</span>
                </div>

                <div className="h-px bg-white/10" />

                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>{t.total}</span>
                  <span>{money(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}