"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";

type Invoice = {
  id: string;
  invoice_number: string | null;
  client_name: string | null;
  client_email: string | null;
  status: string | null;
  total: number | null;
  issue_date: string | null;
  currency?: string | null;
};

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(value || 0);
}

export default function InvoiceListScreen({
  invoices,
}: {
  invoices: Invoice[];
}) {
  const { t } = useLang();

  function translateStatus(status: string | null) {
    const value = (status || "").toLowerCase();
    if (value === "paid") return t.common.paid;
    if (value === "canceled") return t.common.canceled;
    return t.common.pending;
  }

  function statusClass(status: string | null) {
    const value = (status || "").toLowerCase();
    if (value === "paid") return "ui-pill ui-pill-paid";
    if (value === "canceled") return "ui-pill ui-pill-canceled";
    return "ui-pill ui-pill-pending";
  }

  return (
    <main className="ui-page">
      <div className="ui-shell">
        <section className="ui-card p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="ui-badge">{t.common.invoices}</div>
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
                {t.common.invoices}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 md:text-xl">
                Gestiona todas tus facturas con una vista limpia, rápida y profesional.
              </p>
            </div>

            <div className="ui-actions">
              <Link href="/dashboard" className="btn btn-secondary">
                {t.common.dashboard}
              </Link>
              <Link href="/invoice/new" className="btn btn-primary">
                {t.common.createInvoice}
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 ui-card p-4 md:p-6">
          {invoices.length === 0 ? (
            <div className="ui-panel-soft text-center">
              <p className="text-base text-slate-600">
                No tienes facturas todavía.
              </p>
              <div className="mt-5">
                <Link href="/invoice/new" className="btn btn-primary">
                  {t.common.createInvoice}
                </Link>
              </div>
            </div>
          ) : (
            <div className="ui-table-wrap">
              <div className="overflow-x-auto">
                <table className="ui-table min-w-[900px]">
                  <thead>
                    <tr>
                      <th>{t.common.invoice}</th>
                      <th>{t.common.client}</th>
                      <th>{t.common.status}</th>
                      <th>{t.common.amount}</th>
                      <th>{t.common.date}</th>
                      <th>{t.common.action}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="font-semibold text-slate-950">
                          {invoice.invoice_number || "—"}
                        </td>
                        <td>
                          <div>
                            <p className="font-medium text-slate-900">
                              {invoice.client_name || "—"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {invoice.client_email || t.common.noEmail}
                            </p>
                          </div>
                        </td>
                        <td>
                          <span className={statusClass(invoice.status)}>
                            {translateStatus(invoice.status)}
                          </span>
                        </td>
                        <td className="font-semibold text-slate-950">
                          {money(Number(invoice.total || 0), invoice.currency || "USD")}
                        </td>
                        <td className="text-slate-600">
                          {invoice.issue_date
                            ? new Date(invoice.issue_date).toLocaleDateString()
                            : "—"}
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/invoice/${invoice.id}`}
                              className="btn btn-secondary"
                            >
                              {t.common.view}
                            </Link>
                            <Link
                              href={`/invoice/${invoice.id}/edit`}
                              className="btn btn-secondary"
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
          )}
        </section>
      </div>
    </main>
  );
}