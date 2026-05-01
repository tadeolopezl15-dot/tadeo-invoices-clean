"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";

type Invoice = {
  id: string;
  invoice_number?: string | null;
  company_name?: string | null;
  client_name?: string | null;
  customer_name?: string | null;
  total?: number | null;
  currency?: string | null;
  status?: string | null;
  issue_date?: string | null;
  created_at?: string | null;
};

type Props = {
  invoices: Invoice[];
};

function formatMoney(value?: number | null, currency?: string | null) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(Number(value || 0));
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "—";
  }
}

export default function InvoiceListScreen({ invoices }: Props) {
  const { t, lang } = useLang();
  const isSpanish = String(lang) === "es";

  function getStatusLabel(status?: string | null) {
    const value = String(status || "").toLowerCase();

    if (value === "paid") return t.common.paid;
    if (value === "canceled" || value === "cancelled") {
      return isSpanish ? "Cancelada" : "Canceled";
    }

    return t.common.pending;
  }

  function getClientName(invoice: Invoice) {
    return (
      invoice.client_name ||
      invoice.customer_name ||
      invoice.company_name ||
      (isSpanish ? "Cliente sin nombre" : "Unnamed client")
    );
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            Tadeo Invoices
          </p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">
            {t.common.invoices}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isSpanish
              ? "Administra, revisa y abre tus facturas."
              : "Manage, review, and open your invoices."}
          </p>
        </div>

        <Link
          href="/invoice/new"
          className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          + {t.common.createInvoice}
        </Link>
      </div>

      {invoices?.length ? (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
          <div className="hidden grid-cols-12 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 md:grid">
            <div className="col-span-3">
              {isSpanish ? "Factura" : "Invoice"}
            </div>
            <div className="col-span-3">
              {isSpanish ? "Cliente" : "Client"}
            </div>
            <div className="col-span-2">
              {isSpanish ? "Fecha" : "Date"}
            </div>
            <div className="col-span-2">
              {isSpanish ? "Estado" : "Status"}
            </div>
            <div className="col-span-2 text-right">
              {isSpanish ? "Total" : "Total"}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {invoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/invoice/${invoice.id}`}
                className="grid gap-3 px-4 py-4 transition hover:bg-slate-50 md:grid-cols-12 md:items-center"
              >
                <div className="md:col-span-3">
                  <p className="font-bold text-slate-950">
                    {invoice.invoice_number || `INV-${invoice.id.slice(0, 8)}`}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 md:hidden">
                    {formatDate(invoice.issue_date || invoice.created_at)}
                  </p>
                </div>

                <div className="md:col-span-3">
                  <p className="text-sm font-semibold text-slate-700">
                    {getClientName(invoice)}
                  </p>
                </div>

                <div className="hidden text-sm text-slate-500 md:col-span-2 md:block">
                  {formatDate(invoice.issue_date || invoice.created_at)}
                </div>

                <div className="md:col-span-2">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    {getStatusLabel(invoice.status)}
                  </span>
                </div>

                <div className="font-black text-slate-950 md:col-span-2 md:text-right">
                  {formatMoney(invoice.total, invoice.currency)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <h3 className="text-xl font-black text-slate-950">
            {isSpanish ? "No tienes facturas todavía" : "No invoices yet"}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {isSpanish
              ? "Crea tu primera factura profesional y empieza a enviarla a tus clientes."
              : "Create your first professional invoice and start sending it to your clients."}
          </p>

          <Link
            href="/invoice/new"
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            + {t.common.createInvoice}
          </Link>
        </div>
      )}
    </div>
  );
}