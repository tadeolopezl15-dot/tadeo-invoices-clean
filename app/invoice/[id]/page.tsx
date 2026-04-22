import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import DeleteInvoiceButton from "@/components/invoice/DeleteInvoiceButton";
import SendInvoiceEmailButton from "@/components/invoice/SendInvoiceEmailButton";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function InvoiceDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !invoice) {
    notFound();
  }

  const { data: items } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", invoice.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Factura #{invoice.invoice_number}
          </h1>

          <p className="text-sm text-slate-500">
            {invoice.client_name} · {invoice.client_email}
          </p>
        </div>

        <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {invoice.status}
        </span>
      </div>

      {/* BOTONES PREMIUM */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {/* EDITAR */}
        <Link
          href={`/invoice/${invoice.id}/edit`}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Editar
        </Link>

        {/* PDF */}
        <Link
          href={`/api/invoices/${invoice.id}/pdf`}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          PDF
        </Link>

        {/* EMAIL */}
        <SendInvoiceEmailButton
          invoiceId={invoice.id}
          label="Enviar email"
          successLabel="Email enviado"
          errorLabel="Error al enviar"
        />

        {/* ELIMINAR */}
        <DeleteInvoiceButton
          invoiceId={invoice.id}
          label="Eliminar"
        />

        {/* PAGAR (FIX CUADRO NEGRO) */}
        <Link
          href={`/api/invoices/${invoice.id}/pay`}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Pagar
        </Link>

        {/* VISTA PUBLICA */}
        {invoice.public_token && (
          <Link
            href={`/public-invoice/${invoice.public_token}`}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Ver
          </Link>
        )}
      </div>

      {/* DETALLES */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-600">
            Detalles
          </h2>

          <p className="text-sm">
            <strong>Fecha:</strong>{" "}
            {new Date(invoice.issue_date).toLocaleDateString()}
          </p>

          {invoice.due_date && (
            <p className="text-sm">
              <strong>Vencimiento:</strong>{" "}
              {new Date(invoice.due_date).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-600">
            Cliente
          </h2>

          <p className="text-sm">{invoice.client_name}</p>
          <p className="text-sm text-slate-500">
            {invoice.client_email}
          </p>
        </div>
      </div>

      {/* ITEMS */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Descripción</th>
              <th className="px-4 py-3">Cant.</th>
              <th className="px-4 py-3">Precio</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>

          <tbody>
            {items?.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3">{item.description}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">${item.unit_price}</td>
                <td className="px-4 py-3 text-right">
                  ${item.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TOTALES */}
      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-sm space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${invoice.subtotal}</span>
          </div>

          <div className="flex justify-between">
            <span>Impuestos</span>
            <span>${invoice.tax}</span>
          </div>

          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>${invoice.total}</span>
          </div>
        </div>
      </div>

      {/* NOTAS */}
      {invoice.notes && (
        <div className="mt-8 rounded-2xl border border-slate-200 p-5">
          <h2 className="mb-2 text-sm font-semibold text-slate-600">
            Notas
          </h2>

          <p className="text-sm text-slate-700">
            {invoice.notes}
          </p>
        </div>
      )}
    </div>
  );
}