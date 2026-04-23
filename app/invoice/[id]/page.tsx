import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import DeleteInvoiceButton from "@/components/invoice/DeleteInvoiceButton";
import SendInvoiceEmailButton from "@/components/invoice/SendInvoiceEmailButton";

type Props = {
  params: Promise<{ id: string }>;
};

function getStatusClass(status: string | null) {
  const value = (status || "").toLowerCase();
  if (value === "paid") return "ui-pill ui-pill-paid";
  if (value === "canceled") return "ui-pill ui-pill-canceled";
  return "ui-pill ui-pill-pending";
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
    .single();

  if (error || !invoice) notFound();

  const { data: items } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", invoice.id);

  return (
    <main className="ui-page">
      <AppHeader />

      <div className="ui-shell">
        <div className="ui-card p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
                Factura #{invoice.invoice_number}
              </h1>
              <p className="mt-2 text-base text-slate-500">
                {invoice.client_name} · {invoice.client_email}
              </p>
            </div>

            <span className={getStatusClass(invoice.status)}>
              {invoice.status || "pending"}
            </span>
          </div>

          <div className="ui-actions mt-6">
            <Link href={`/invoice/${invoice.id}/edit`} className="btn btn-secondary">
              Editar
            </Link>

            <Link href={`/api/invoices/${invoice.id}/pdf`} className="btn btn-secondary">
              PDF
            </Link>

            <SendInvoiceEmailButton
              invoiceId={invoice.id}
              label="Enviar email"
              successLabel="Email enviado"
              errorLabel="No se pudo enviar"
            />

            <DeleteInvoiceButton invoiceId={invoice.id} label="Eliminar" />

            <Link href={`/api/invoices/${invoice.id}/pay`} className="btn btn-primary">
              Pagar
            </Link>

            {invoice.public_token ? (
              <Link
                href={`/public-invoice/${invoice.public_token}`}
                className="btn btn-secondary"
              >
                Ver
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="ui-panel">
            <h2 className="text-lg font-bold text-slate-900">Detalles</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p>
                <strong>Fecha de emisión:</strong>{" "}
                {invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString() : "-"}
              </p>
              <p>
                <strong>Fecha de vencimiento:</strong>{" "}
                {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "-"}
              </p>
            </div>
          </div>

          <div className="ui-panel">
            <h2 className="text-lg font-bold text-slate-900">Cliente</h2>
            <div className="mt-4">
              <p className="text-base font-semibold text-slate-900">{invoice.client_name}</p>
              <p className="mt-1 text-sm text-slate-500">{invoice.client_email}</p>
            </div>
          </div>
        </div>

        <div className="ui-table-wrap mt-6">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Cant.</th>
                <th>Precio</th>
                <th style={{ textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items?.map((item) => (
                <tr key={item.id}>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>${item.unit_price}</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>
                    ${item.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 ml-auto w-full max-w-md space-y-3">
          <div className="ui-kv">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-semibold text-slate-950">${invoice.subtotal}</span>
          </div>
          <div className="ui-kv">
            <span className="text-slate-500">Impuestos</span>
            <span className="font-semibold text-slate-950">${invoice.tax}</span>
          </div>
          <div
            className="ui-kv"
            style={{ background: "#0f172a", borderColor: "#0f172a" }}
          >
            <span style={{ color: "white", fontWeight: 600 }}>Total</span>
            <span style={{ color: "white", fontWeight: 800, fontSize: 22 }}>
              ${invoice.total}
            </span>
          </div>
        </div>

        {invoice.notes ? (
          <div className="ui-panel mt-6">
            <h2 className="text-lg font-bold text-slate-900">Notas</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {invoice.notes}
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}