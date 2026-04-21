"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";

type InvoiceRow = {
  id: string;
  invoice_number: string | null;
  client_name: string | null;
  client_email: string | null;
  status: string | null;
  total: number | null;
  currency: string | null;
  issue_date: string | null;
};

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(value || 0);
}

function statusClasses(status: string | null) {
  const value = (status || "").toLowerCase();

  if (value === "paid") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (value === "canceled") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

export default function InvoiceListScreen({
  invoices,
}: {
  invoices: InvoiceRow[];
}) {
  const { lang, t } = useLang();

  function translateStatus(status: string | null) {
    const value = (status || "").toLowerCase();
    if (value === "paid") return t.common.paid;
    if (value === "canceled") return t.common.canceled;
    return t.common.pending;
  }

  if (invoices.length === 0) {
    return (
      <div className="rounded-[30px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h3 className="text-xl font-bold text-slate-900">
          {lang === "es"
            ? "No tienes facturas todavía"
            : "You do not have invoices yet"}
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          {lang === "es"
            ? "Crea tu primera factura para comenzar."
            : "Create your first invoice to get started."}
        </p>
        <Link
          href="/invoice/new"
          className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          {t.common.createInvoice}
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full text-left">
          <thead className="bg-slate-50">
            <tr className="text-sm text-slate-500">
              <th className="px-6 py-4 font-semibold">
                {lang === "es" ? "Número" : "Number"}
              </th>
              <th className="px-6 py-4 font-semibold">{t.common.client}</th>
              <th className="px-6 py-4 font-semibold">{t.common.email}</th>
              <th className="px-6 py-4 font-semibold">{t.common.status}</th>
              <th className="px-6 py-4 font-semibold">{t.common.amount}</th>
              <th className="px-6 py-4 font-semibold">{t.common.date}</th>
              <th className="px-6 py-4 font-semibold">{t.common.action}</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="border-t border-slate-100 text-sm text-slate-700"
              >
                <td className="px-6 py-4 font-semibold text-slate-950">
                  {invoice.invoice_number || "—"}
                </td>
                <td className="px-6 py-4 text-slate-900">
                  {invoice.client_name || "—"}
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {invoice.client_email || t.common.noEmail}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(
                      invoice.status
                    )}`}
                  >
                    {translateStatus(invoice.status)}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-950">
                  {money(Number(invoice.total || 0), invoice.currency || "USD")}
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {invoice.issue_date
                    ? new Date(invoice.issue_date).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/invoice/${invoice.id}`}
                      className="inline-flex rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {t.common.view}
                    </Link>
                    <Link
                      href={`/invoice/${invoice.id}/edit`}
                      className="inline-flex rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                    >
                      {t.common.edit}
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}