import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

type PageProps = {
  params: Promise<{ token: string }>;
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));
}

export default async function PublicInvoicePage({ params }: PageProps) {
  const { token } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("token", token)
    .single();

  if (error || !invoice) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl ring-1 ring-neutral-200">
        <div className="mb-8 flex flex-col gap-6 border-b border-neutral-200 pb-8 md:flex-row md:items-start md:justify-between">
          <div>
            {invoice.company_logo_url ? (
              <img
                src={invoice.company_logo_url}
                alt="Logo empresa"
                className="mb-4 h-20 w-auto object-contain"
              />
            ) : null}

            <h1 className="text-3xl font-bold text-neutral-900">
              {invoice.company_name || "Mi Empresa"}
            </h1>

            {invoice.company_email ? (
              <p className="mt-2 text-sm text-neutral-600">{invoice.company_email}</p>
            ) : null}

            {invoice.company_phone ? (
              <p className="text-sm text-neutral-600">{invoice.company_phone}</p>
            ) : null}

            {invoice.company_address ? (
              <p className="text-sm text-neutral-600">{invoice.company_address}</p>
            ) : null}
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
              Factura
            </p>
            <h2 className="mt-1 text-2xl font-bold text-neutral-900">
              {invoice.invoice_number || "INV"}
            </h2>

            <span
              className={`mt-4 inline-flex rounded-full px-4 py-2 text-xs font-bold ${
                invoice.status === "paid"
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {invoice.status === "paid" ? "Pagada" : "Pendiente"}
            </span>
          </div>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Facturar a
            </p>
            <p className="text-lg font-semibold text-neutral-900">
              {invoice.client_name || "-"}
            </p>
            {invoice.client_email ? (
              <p className="mt-1 text-sm text-neutral-600">{invoice.client_email}</p>
            ) : null}
            {invoice.client_address ? (
              <p className="mt-1 text-sm text-neutral-600">{invoice.client_address}</p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-neutral-200 p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Detalles
            </p>
            <div className="space-y-2 text-sm text-neutral-700">
              <div className="flex justify-between gap-4">
                <span>Fecha emisión</span>
                <span>{invoice.issue_date || "-"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Fecha vencimiento</span>
                <span>{invoice.due_date || "-"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-neutral-200 p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Notas
          </p>
          <p className="text-sm leading-7 text-neutral-700">
            {invoice.notes || "Gracias por su negocio."}
          </p>
        </div>

        <div className="ml-auto max-w-sm rounded-2xl border border-neutral-900 p-5">
          <div className="flex items-center justify-between py-2 text-sm text-neutral-700">
            <span>Subtotal</span>
            <span>{money(invoice.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between py-2 text-sm text-neutral-700">
            <span>Impuesto</span>
            <span>{money(invoice.tax)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-4 text-lg font-bold text-neutral-900">
            <span>Total</span>
            <span>{money(invoice.total)}</span>
          </div>
        </div>
      </div>
    </main>
  );
}