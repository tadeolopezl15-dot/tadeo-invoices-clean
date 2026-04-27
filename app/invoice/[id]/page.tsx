import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import Link from "next/link";
import PayInvoiceButton from "@/components/invoice/PayInvoiceButton";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createServerClient();

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !invoice) {
    console.error("LOAD_INVOICE_ERROR", error);
    return notFound();
  }

  const { data: items } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", invoice.id);

  const currency = invoice.currency || "USD";

  function money(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(Number(value || 0));
  }

  return (
    <main className="ui-page">
      <AppHeader />

      <div className="ui-shell">
        {/* HEADER */}
        <section className="ui-card p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="ui-badge">Factura</div>

              <h1 className="mt-3 text-3xl font-extrabold text-slate-950 md:text-5xl">
                #{invoice.invoice_number || invoice.id}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Cliente: <strong>{invoice.client_name}</strong>
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/api/invoices/${invoice.id}/pdf`}
                target="_blank"
                className="btn btn-secondary"
              >
                Descargar PDF
              </Link>

              <PayInvoiceButton invoiceId={invoice.id} label="Pagar factura" />
            </div>
          </div>
        </section>

        {/* INFO */}
        <section className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="ui-card p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Cliente
            </p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              {invoice.client_name}
            </p>
            <p className="text-sm text-slate-500">
              {invoice.client_email || "-"}
            </p>
          </div>

          <div className="ui-card p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Fechas
            </p>
            <p className="mt-2 text-sm text-slate-700">
              Emisión: {invoice.issue_date || "-"}
            </p>
            <p className="text-sm text-slate-700">
              Vencimiento: {invoice.due_date || "-"}
            </p>
          </div>

          <div className="ui-card p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Estado
            </p>
            <p
              className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-bold ${
                invoice.status === "paid"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {invoice.status || "draft"}
            </p>
          </div>
        </section>

        {/* ITEMS */}
        <section className="mt-6 ui-card p-6 md:p-8">
          <h2 className="text-xl font-black text-slate-950">
            Desglose de materiales
          </h2>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 text-left text-sm text-slate-600">
                  <th className="p-3">Descripción</th>
                  <th className="p-3">Cant.</th>
                  <th className="p-3">Precio</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>

              <tbody>
                {(items || []).map((item) => {
                  const qty = Number(item.quantity || 1);
                  const price = Number(item.unit_price || 0);
                  const total = qty * price;

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 text-sm"
                    >
                      <td className="p-3">{item.description}</td>
                      <td className="p-3">{qty}</td>
                      <td className="p-3">{money(price)}</td>
                      <td className="p-3 text-right font-bold">
                        {money(total)}
                      </td>
                    </tr>
                  );
                })}

                {(!items || items.length === 0) && (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-6 text-center text-slate-400"
                    >
                      No hay materiales en esta factura
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* TOTAL */}
        <section className="mt-6 flex justify-end">
          <div className="ui-card w-full max-w-md p-6">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>{money(Number(invoice.subtotal || 0))}</span>
            </div>

            <div className="mt-2 flex justify-between text-sm text-slate-600">
              <span>Impuestos</span>
              <span>{money(Number(invoice.tax_total || 0))}</span>
            </div>

            <div className="mt-4 flex justify-between text-lg font-extrabold text-slate-950">
              <span>Total</span>
              <span>{money(Number(invoice.total || 0))}</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}