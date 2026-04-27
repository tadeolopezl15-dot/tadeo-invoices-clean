import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import DeleteInvoiceButton from "@/components/invoice/DeleteInvoiceButton";
import SendInvoiceEmailButton from "@/components/invoice/SendInvoiceEmailButton";

type Props = {
  params: Promise<{ id: string }>;
};

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(value || 0));
}

function getStatusClass(status: string | null) {
  const value = (status || "").toLowerCase();

  if (value === "paid") {
    return "inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700";
  }

  if (value === "canceled") {
    return "inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700";
  }

  return "inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700";
}

export default async function InvoiceDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !invoice) notFound();

  const { data: items } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", invoice.id);

  const currency = invoice.currency || "USD";
  const subtotal = Number(invoice.subtotal || 0);
  const tax = Number(invoice.tax_total ?? invoice.tax ?? 0);
  const total = Number(invoice.total || subtotal + tax || 0);
  const status = String(invoice.status || "draft").toLowerCase();

  return (
    <main className="ui-page">
      <AppHeader />

      <div className="ui-shell">
        <section className="ui-card p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="ui-badge">Factura</div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
                Factura #{invoice.invoice_number || invoice.id}
              </h1>

              <p className="mt-3 text-base text-slate-500">
                {invoice.client_name || "Cliente"} ·{" "}
                {invoice.client_email || "Sin email"}
              </p>
            </div>

            <span className={getStatusClass(status)}>
              {status.toUpperCase()}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/invoice/${invoice.id}/edit`}
              className="btn btn-secondary"
            >
              Editar
            </Link>

            <Link
              href={`/api/invoices/${invoice.id}/pdf`}
              target="_blank"
              className="btn btn-secondary"
            >
              PDF
            </Link>

            <SendInvoiceEmailButton
              invoiceId={invoice.id}
              label="Enviar email"
              successLabel="Email enviado"
              errorLabel="No se pudo enviar"
            />

            <DeleteInvoiceButton invoiceId={invoice.id} label="Eliminar" />

            <Link
              href={`/api/invoices/${invoice.id}/pay`}
              className="btn btn-primary"
            >
              Pagar factura
            </Link>

            {invoice.public_token ? (
              <Link
                href={`/public-invoice/${invoice.public_token}`}
                className="btn btn-secondary"
              >
                Ver pública
              </Link>
            ) : null}
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="ui-card p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Cliente
            </p>
            <p className="mt-3 text-lg font-bold text-slate-950">
              {invoice.client_name || "-"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {invoice.client_email || "-"}
            </p>
          </div>

          <div className="ui-card p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Fechas
            </p>
            <p className="mt-3 text-sm text-slate-700">
              <strong>Emisión:</strong>{" "}
              {invoice.issue_date
                ? new Date(invoice.issue_date).toLocaleDateString()
                : "-"}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              <strong>Vencimiento:</strong>{" "}
              {invoice.due_date
                ? new Date(invoice.due_date).toLocaleDateString()
                : "-"}
            </p>
          </div>

          <div className="ui-card p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Total
            </p>
            <p className="mt-3 text-3xl font-black text-blue-600">
              {money(total, currency)}
            </p>
            <p className="mt-1 text-sm text-slate-500">{currency}</p>
          </div>
        </section>

        <section className="ui-card mt-6 p-6 md:p-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Desglose de materiales
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Productos, materiales o servicios incluidos en esta factura.
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="bg-slate-100 text-left text-sm text-slate-600">
                  <th className="rounded-l-2xl p-4">Descripción</th>
                  <th className="p-4">Cant.</th>
                  <th className="p-4">Precio</th>
                  <th className="rounded-r-2xl p-4 text-right">Total</th>
                </tr>
              </thead>

              <tbody>
                {(items || []).map((item) => {
                  const qty = Number(item.quantity ?? item.qty ?? 1);
                  const price = Number(item.unit_price ?? item.price ?? 0);
                  const lineTotal = Number(
                    item.line_total ?? item.total ?? qty * price
                  );

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 text-sm text-slate-700"
                    >
                      <td className="p-4 font-semibold text-slate-950">
                        {item.description || "-"}
                      </td>
                      <td className="p-4">{qty}</td>
                      <td className="p-4">{money(price, currency)}</td>
                      <td className="p-4 text-right font-bold text-slate-950">
                        {money(lineTotal, currency)}
                      </td>
                    </tr>
                  );
                })}

                {(!items || items.length === 0) && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">
                      No hay materiales agregados en esta factura.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 flex justify-end">
          <div className="ui-card w-full max-w-md p-6">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-950">
                {money(subtotal, currency)}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
              <span>Impuestos</span>
              <span className="font-semibold text-slate-950">
                {money(tax, currency)}
              </span>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-slate-950">
                  Total
                </span>
                <span className="text-2xl font-black text-blue-600">
                  {money(total, currency)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {invoice.notes ? (
          <section className="ui-card mt-6 p-6">
            <h2 className="text-lg font-bold text-slate-900">Notas</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {invoice.notes}
            </p>
          </section>
        ) : null}
      </div>
    </main>
  );
}