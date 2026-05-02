"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type InvoiceItem = {
  id?: string;
  description?: string | null;
  quantity?: number | null;
  qty?: number | null;
  unit_price?: number | null;
  price?: number | null;
  line_total?: number | null;
};

type Invoice = {
  id: string;
  invoice_number?: string | null;
  client_name?: string | null;
  client_email?: string | null;
  company_name?: string | null;
  company_email?: string | null;
  status?: string | null;
  currency?: string | null;
  issue_date?: string | null;
  due_date?: string | null;
  subtotal?: number | null;
  tax_total?: number | null;
  total?: number | null;
  public_token?: string | null;
  notes?: string | null;
  invoice_items?: InvoiceItem[];
};

export default function InvoiceDetailScreen({ invoice }: { invoice: Invoice }) {
  const router = useRouter();
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState("");

  const currency = invoice.currency || "USD";

  function money(value?: number | null) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(Number(value || 0));
  }

  function formatDate(date?: string | null) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("es-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  }

  async function handleDelete() {
    const ok = window.confirm("¿Seguro que quieres eliminar esta factura?");
    if (!ok) return;

    try {
      setLoadingDelete(true);
      setError("");

      const res = await fetch(`/api/invoices/${invoice.id}/delete`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "No se pudo eliminar la factura.");
      }

      router.push("/invoice");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Error eliminando factura.");
    } finally {
      setLoadingDelete(false);
    }
  }

  const pdfUrl = `/api/invoices/${invoice.id}/pdf`;
  const downloadUrl = `/api/invoices/${invoice.id}/pdf`;
  const emailUrl = `/invoice/${invoice.id}/email`;
  const editUrl = `/invoice/${invoice.id}/edit`;
  const payUrl = `/api/invoices/${invoice.id}/pay`;
  const publicUrl = invoice.public_token
    ? `/public-invoice/${invoice.public_token}`
    : `/invoice/${invoice.id}`;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
          <p className="text-lg text-slate-700">Factura</p>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950">
            Factura #{invoice.invoice_number || "Sin número"}
          </h1>

          <p className="mt-4 text-xl text-slate-500">
            {invoice.client_name || "Sin cliente"} ·{" "}
            {invoice.client_email || "Sin email"}
          </p>

          <div className="mt-8">
            <span
              className={`block rounded-full px-4 py-2 text-sm font-black uppercase ${
                invoice.status === "paid"
                  ? "bg-emerald-100 text-emerald-700"
                  : invoice.status === "sent"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-700"
              }`}
            >
              {invoice.status || "pending"}
            </span>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href={editUrl as any} className="btn-light">
              Editar
            </Link>

            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="btn-light">
              PDF
            </a>

            <a href={downloadUrl} download className="btn-light">
              Descargar
            </a>

            <Link href={emailUrl as any} className="btn-light">
              Enviar email
            </Link>

            <a href={payUrl} className="btn-light">
              Pagar factura
            </a>

            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="btn-light">
              Ver pública
            </a>

            <button
              onClick={handleDelete}
              disabled={loadingDelete}
              className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 font-bold text-red-600 hover:bg-red-100 disabled:opacity-60"
            >
              {loadingDelete ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
            <h2 className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">
              Cliente
            </h2>

            <div className="mt-6">
              <p className="text-2xl font-black">
                {invoice.client_name || "Sin cliente"}
              </p>
              <p className="mt-2 text-lg text-slate-500">
                {invoice.client_email || "Sin email"}
              </p>
            </div>

            <h2 className="mt-12 text-sm font-black uppercase tracking-[0.25em] text-slate-400">
              Fechas
            </h2>

            <div className="mt-6 space-y-2 text-lg text-slate-700">
              <p>
                <strong>Emisión:</strong> {formatDate(invoice.issue_date)}
              </p>
              <p>
                <strong>Vencimiento:</strong> {formatDate(invoice.due_date)}
              </p>
            </div>

            <h2 className="mt-12 text-sm font-black uppercase tracking-[0.25em] text-slate-400">
              Productos / Servicios
            </h2>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Descripción</th>
                    <th className="px-4 py-3 text-right">Cant.</th>
                    <th className="px-4 py-3 text-right">Precio</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {(invoice.invoice_items || []).length > 0 ? (
                    invoice.invoice_items!.map((item, index) => {
                      const qty = Number(item.quantity ?? item.qty ?? 0);
                      const price = Number(item.unit_price ?? item.price ?? 0);
                      const lineTotal = Number(item.line_total ?? qty * price);

                      return (
                        <tr key={item.id || index}>
                          <td className="px-4 py-4 font-semibold">
                            {item.description || "Servicio"}
                          </td>
                          <td className="px-4 py-4 text-right">{qty}</td>
                          <td className="px-4 py-4 text-right">
                            {money(price)}
                          </td>
                          <td className="px-4 py-4 text-right font-black">
                            {money(lineTotal)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                        Esta factura no tiene productos guardados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {invoice.notes && (
              <>
                <h2 className="mt-12 text-sm font-black uppercase tracking-[0.25em] text-slate-400">
                  Notas
                </h2>
                <p className="mt-4 whitespace-pre-line rounded-2xl bg-slate-50 p-4 text-slate-600">
                  {invoice.notes}
                </p>
              </>
            )}
          </div>

          <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
            <h2 className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">
              Total
            </h2>

            <div className="mt-6 space-y-4">
              <Row label="Subtotal" value={money(invoice.subtotal)} />
              <Row label="Tax" value={money(invoice.tax_total)} />
              <div className="h-px bg-slate-200" />
              <div className="flex items-center justify-between">
                <span className="text-lg font-black">Total</span>
                <span className="text-3xl font-black text-slate-950">
                  {money(invoice.total)}
                </span>
              </div>
            </div>
          </aside>
        </section>
      </div>

      <style jsx>{`
        .btn-light {
          border-radius: 1rem;
          padding: 0.75rem 1.25rem;
          font-weight: 800;
          color: #0f172a;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .btn-light:hover {
          background: #e2e8f0;
        }
      `}</style>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-slate-600">
      <span>{label}</span>
      <span className="font-bold text-slate-950">{value}</span>
    </div>
  );
}