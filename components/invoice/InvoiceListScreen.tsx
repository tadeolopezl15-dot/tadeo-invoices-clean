"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Invoice = {
  id: string;
  invoice_number?: string | null;
  client_name?: string | null;
  client_email?: string | null;
  status?: string | null;
  currency?: string | null;
  total?: number | null;
  issue_date?: string | null;
  due_date?: string | null;
  public_token?: string | null;
};

export default function InvoiceListScreen({
  invoices,
}: {
  invoices: Invoice[];
}) {
  const [query, setQuery] = useState("");

  function money(value: number | null | undefined, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(Number(value || 0));
  }

  function formatDate(date?: string | null) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("es-US");
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return invoices.filter((i) =>
      `${i.invoice_number} ${i.client_name} ${i.client_email} ${i.status}`
        .toLowerCase()
        .includes(q)
    );
  }, [invoices, query]);

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 rounded-3xl border border-white/10 bg-[#020617] p-6 shadow-2xl">
          <p className="text-sm font-semibold text-cyan-300">
            Tadeo Invoices
          </p>

          <h1 className="mt-2 text-4xl font-black">Facturas</h1>

          <p className="mt-2 text-slate-400">
            Ver, editar, descargar PDF y enviar facturas a tus clientes.
          </p>

          <Link
            href="/invoice/new"
            className="mt-6 inline-block w-full rounded-2xl bg-cyan-500 px-6 py-4 text-center font-black text-slate-950 hover:bg-cyan-400"
          >
            + Nueva factura
          </Link>
        </div>

        {/* BUSCAR */}
        <div className="mb-6 rounded-3xl border border-white/10 bg-[#020617] p-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por cliente, número, email o estado..."
            className="w-full rounded-2xl border border-white/10 bg-[#020617] px-4 py-4 text-white outline-none placeholder:text-slate-500"
          />
        </div>

        {/* TABLA */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#020617] shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-4 text-left">Fecha</th>
                  <th className="px-6 py-4 text-left">Vence</th>
                  <th className="px-6 py-4 text-left">Estado</th>
                  <th className="px-6 py-4 text-left">Total</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {filtered.map((inv) => {
                  const pdfUrl = `/api/invoices/${inv.id}/pdf`;
                  const publicUrl = inv.public_token
                    ? `/public-invoice/${inv.public_token}`
                    : `/invoice/${inv.id}`;

                  return (
                    <tr key={inv.id}>
                      <td className="px-6 py-5">
                        {formatDate(inv.issue_date)}
                      </td>

                      <td className="px-6 py-5">
                        {formatDate(inv.due_date)}
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-bold text-yellow-400">
                          {inv.status || "pendiente"}
                        </span>
                      </td>

                      <td className="px-6 py-5 font-black text-cyan-400">
                        {money(inv.total, inv.currency || "USD")}
                      </td>

                      <td className="px-6 py-5 text-right">
                        <div className="flex flex-wrap justify-end gap-2">

                          <Link href={`/invoice/${inv.id}`} className="btn">
                            Ver
                          </Link>

                          <Link href={`/invoice/${inv.id}/edit`} className="btn">
                            Editar
                          </Link>

                          <a href={pdfUrl} target="_blank" className="btn-purple">
                            PDF
                          </a>

                          <a href={pdfUrl} download className="btn-cyan">
                            Descargar
                          </a>

                          <Link href={`/invoice/${inv.id}/email`} className="btn-green">
                            Email
                          </Link>

                          <a href={publicUrl} target="_blank" className="btn">
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
        </div>
      </div>

      <style jsx>{`
        .btn {
          border-radius: 0.75rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 800;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .btn:hover {
          background: rgba(255,255,255,0.1);
        }

        .btn-purple {
          background: rgba(168,85,247,0.15);
          color: #c084fc;
          border-radius: 0.75rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 800;
        }

        .btn-cyan {
          background: rgba(34,211,238,0.15);
          color: #22d3ee;
          border-radius: 0.75rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 800;
        }

        .btn-green {
          background: rgba(16,185,129,0.15);
          color: #34d399;
          border-radius: 0.75rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 800;
        }
      `}</style>
    </main>
  );
}