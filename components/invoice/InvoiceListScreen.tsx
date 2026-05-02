"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

type Invoice = {
  id: string;
  invoice_number?: string | null;
  client_name?: string | null;
  client_email?: string | null;
  company_name?: string | null;
  status?: string | null;
  currency?: string | null;
  total?: number | null;
  issue_date?: string | null;
  due_date?: string | null;
  public_token?: string | null;
};

type Props = {
  invoices: Invoice[];
};

function money(value: number | null | undefined, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(value || 0));
}

function formatDate(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("es-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function InvoiceListScreen({ invoices }: Props) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");

  const filteredInvoices = useMemo(() => {
    const q = query.toLowerCase().trim();

    if (!q) return invoices;

    return invoices.filter((invoice) => {
      return (
        invoice.invoice_number?.toLowerCase().includes(q) ||
        invoice.client_name?.toLowerCase().includes(q) ||
        invoice.client_email?.toLowerCase().includes(q) ||
        invoice.status?.toLowerCase().includes(q)
      );
    });
  }, [invoices, query]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-cyan-300">
              Tadeo Invoices
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Facturas
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Ver, editar, descargar PDF y enviar facturas a tus clientes.
            </p>
          </div>

          <Link
            href="/invoice/new"
            className="rounded-2xl bg-cyan-400 px-5 py-3 text-center font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-300"
          >
            + Nueva factura
          </Link>
        </div>

        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por cliente, número, email o estado..."
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
          />
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl">
          {filteredInvoices.length === 0 ? (
            <div className="p-10 text-center">
              <h2 className="text-xl font-bold">No hay facturas</h2>
              <p className="mt-2 text-slate-400">
                Crea tu primera factura para verla aquí.
              </p>

              <Link
                href="/invoice/new"
                className="mt-6 inline-flex rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-300"
              >
                Crear factura
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-5 py-4">Factura</th>
                    <th className="px-5 py-4">Cliente</th>
                    <th className="px-5 py-4">Fecha</th>
                    <th className="px-5 py-4">Vence</th>
                    <th className="px-5 py-4">Estado</th>
                    <th className="px-5 py-4 text-right">Total</th>
                    <th className="px-5 py-4 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {filteredInvoices.map((invoice) => {
                    const pdfUrl = `/api/invoices/${invoice.id}/pdf`;
                    const emailUrl = `/invoice/${invoice.id}/email`;
                    const viewUrl = `/invoice/${invoice.id}`;
                    const editUrl = `/invoice/${invoice.id}/edit`;
                    const publicUrl = invoice.public_token
                      ? `/public-invoice/${invoice.public_token}`
                      : `/invoice/${invoice.id}`;

                    return (
                      <tr key={invoice.id} className="hover:bg-white/[0.03]">
                        <td className="px-5 py-5">
                          <div className="font-bold text-white">
                            {invoice.invoice_number || "Sin número"}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            ID: {invoice.id.slice(0, 8)}
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <div className="font-semibold">
                            {invoice.client_name || "Sin cliente"}
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            {invoice.client_email || "Sin email"}
                          </div>
                        </td>

                        <td className="px-5 py-5 text-sm text-slate-300">
                          {formatDate(invoice.issue_date)}
                        </td>

                        <td className="px-5 py-5 text-sm text-slate-300">
                          {formatDate(invoice.due_date)}
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={
                              invoice.status === "paid"
                                ? "rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300"
                                : "rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300"
                            }
                          >
                            {invoice.status === "paid" ? "Pagada" : "Pendiente"}
                          </span>
                        </td>

                        <td className="px-5 py-5 text-right font-black text-cyan-300">
                          {money(invoice.total, invoice.currency || "USD")}
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Link
                              href={viewUrl}
                              className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/10"
                            >
                              Ver
                            </Link>

                            <Link
                              href={editUrl}
                              className="rounded-xl border border-blue-400/30 bg-blue-400/10 px-3 py-2 text-xs font-bold text-blue-200 hover:bg-blue-400/20"
                            >
                              Editar
                            </Link>

                            <a
                              href={pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-xl border border-purple-400/30 bg-purple-400/10 px-3 py-2 text-xs font-bold text-purple-200 hover:bg-purple-400/20"
                            >
                              PDF
                            </a>

                            <a
                              href={pdfUrl}
                              download
                              className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-400/20"
                            >
                              Descargar
                            </a>

                            <Link
                              href={emailUrl}
                              className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-400/20"
                            >
                              Email
                            </Link>

                            <a
                              href={publicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10"
                            >
                              Link público
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}