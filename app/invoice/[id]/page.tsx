import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import DeleteInvoiceButton from "@/components/invoice/DeleteInvoiceButton";
import SendInvoiceEmailButton from "@/components/invoice/SendInvoiceEmailButton";
import { getServerLang } from "@/lib/server-lang";

type Props = {
  params: Promise<{ id: string }>;
};

const translations = {
  es: {
    invoice: "Factura",
    edit: "Editar",
    email: "Enviar email",
    emailSent: "Email enviado",
    emailError: "No se pudo enviar",
    delete: "Eliminar",
    publicView: "Vista pública",
    details: "Detalles",
    issueDate: "Fecha de emisión",
    dueDate: "Fecha de vencimiento",
    client: "Cliente",
    description: "Descripción",
    qty: "Cant.",
    price: "Precio",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Impuestos",
    notes: "Notas",
  },
  en: {
    invoice: "Invoice",
    edit: "Edit",
    email: "Send email",
    emailSent: "Email sent",
    emailError: "Could not send",
    delete: "Delete",
    publicView: "Public view",
    details: "Details",
    issueDate: "Issue date",
    dueDate: "Due date",
    client: "Client",
    description: "Description",
    qty: "Qty",
    price: "Price",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Tax",
    notes: "Notes",
  },
} as const;

export default async function InvoiceDetailPage({ params }: Props) {
  const { id } = await params;
  const lang = await getServerLang();
  const t = translations[lang];

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
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t.invoice} #{invoice.invoice_number}
          </h1>

          <p className="text-sm text-slate-500">
            {invoice.client_name} · {invoice.client_email}
          </p>
        </div>

        <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {invoice.status}
        </span>
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href={`/invoice/${invoice.id}/edit`}
          className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
        >
          {t.edit}
        </Link>

        <Link
          href={`/api/invoices/${invoice.id}/pdf`}
          className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
        >
          PDF
        </Link>

        <SendInvoiceEmailButton
          invoiceId={invoice.id}
          label={t.email}
          successLabel={t.emailSent}
          errorLabel={t.emailError}
        />

        <DeleteInvoiceButton invoiceId={invoice.id} label={t.delete} />

        {invoice.public_token && (
          <Link
            href={`/public-invoice/${invoice.public_token}`}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            {t.publicView}
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-600">
            {t.details}
          </h2>

          <p className="text-sm">
            <strong>{t.issueDate}:</strong>{" "}
            {invoice.issue_date
              ? new Date(invoice.issue_date).toLocaleDateString()
              : "-"}
          </p>

          {invoice.due_date && (
            <p className="text-sm">
              <strong>{t.dueDate}:</strong>{" "}
              {new Date(invoice.due_date).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-600">
            {t.client}
          </h2>

          <p className="text-sm">{invoice.client_name}</p>
          <p className="text-sm text-slate-500">{invoice.client_email}</p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">{t.description}</th>
              <th className="px-4 py-3">{t.qty}</th>
              <th className="px-4 py-3">{t.price}</th>
              <th className="px-4 py-3 text-right">{t.total}</th>
            </tr>
          </thead>

          <tbody>
            {items?.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3">{item.description}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">${item.unit_price}</td>
                <td className="px-4 py-3 text-right">${item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-sm space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{t.subtotal}</span>
            <span>${invoice.subtotal}</span>
          </div>

          <div className="flex justify-between">
            <span>{t.tax}</span>
            <span>${invoice.tax}</span>
          </div>

          <div className="flex justify-between text-lg font-semibold">
            <span>{t.total}</span>
            <span>${invoice.total}</span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div className="mt-8 rounded-2xl border border-slate-200 p-5">
          <h2 className="mb-2 text-sm font-semibold text-slate-600">
            {t.notes}
          </h2>

          <p className="text-sm text-slate-700">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}