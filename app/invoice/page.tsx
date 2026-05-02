"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Invoice = {
  id: string;
  invoice_number?: string;
  client_name?: string;
  client_email?: string;
  status?: string;
  total?: number;
  currency?: string;
  issue_date?: string;
  due_date?: string;
  public_token?: string;
};

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((data) => setInvoices(data || []));
  }, []);

  function money(value?: number, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(Number(value || 0));
  }

  function formatDate(date?: string) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US");
  }

  const filtered = invoices.filter((inv) =>
    `${inv.client_name} ${inv.client_email} ${inv.invoice_number} ${inv.status}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h1 className="text-4xl font-black">Invoices</h1>
          <p className="mt-2 text-slate-400">
            Manage, track, and send professional invoices to your clients.
          </p>

          <Link
            href="/invoice/new"
            className="mt-6 inline-block w-full rounded-2xl bg-cyan-400 px-6 py-4 text-center font-black text-black"
          >
            + New Invoice
          </Link>
        </div>

        {/* SEARCH */}
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by client, invoice number, email, or status..."
            className="w-full rounded-2xl border border-white/10 bg-[#020617] px-4 py-4 text-white outline-none"
          />
        </div>

        {/* TABLE */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] overflow-hidden">
          <table className="w-full text-left">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {filtered.map((inv) => {
                const pdfUrl = `/api/invoices/${inv.id}/pdf`;

                return (
                  <tr key={inv.id}>
                    <td className="px-6 py-5">{formatDate(inv.issue_date)}</td>
                    <td className="px-6 py-5">{formatDate(inv.due_date)}</td>

                    <td className="px-6 py-5">
                      <span className="px-3 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400 font-bold">
                        {inv.status || "pending"}
                      </span>
                    </td>

                    <td className="px-6 py-5 font-black text-cyan-300">
                      {money(inv.total, inv.currency)}
                    </td>

                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 flex-wrap">

                        <Link href={`/invoice/${inv.id}`} className="btn">
                          View
                        </Link>

                        <Link href={`/invoice/${inv.id}/edit`} className="btn">
                          Edit
                        </Link>

                        <a href={pdfUrl} target="_blank" className="btn">
                          PDF
                        </a>

                        <a href={pdfUrl} download className="btn">
                          Download
                        </a>

                        <Link href={`/invoice/${inv.id}/email`} className="btn">
                          Email
                        </Link>

                        <a
                          href={
                            inv.public_token
                              ? `/public-invoice/${inv.public_token}`
                              : `/invoice/${inv.id}`
                          }
                          target="_blank"
                          className="btn"
                        >
                          Public Link
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

      <style jsx>{`
        .btn {
          border: 1px solid rgba(255,255,255,0.1);
          padding: 6px 10px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: bold;
        }

        .btn:hover {
          background: rgba(255,255,255,0.1);
        }
      `}</style>
    </main>
  );
}