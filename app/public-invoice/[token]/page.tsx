import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

type Params = Promise<{ token: string }>;
type SearchParams = Promise<{ lang?: "es" | "en" }>;

type InvoiceRow = {
  id: string;
  invoice_number: string | null;
  client_name: string | null;
  client_email: string | null;
  status: string | null;
  total: number | null;
  subtotal: number | null;
  tax: number | null;
  currency: string | null;
  issue_date: string | null;
  due_date: string | null;
  notes: string | null;
};

type InvoiceItemRow = {
  id: string;
  description: string | null;
  quantity: number | null;
  unit_price: number | null;
  total: number | null;
};

const translations = {
  es: {
    title: "Factura pública",
    invoice: "Factura",
    status: "Estado",
    from: "De",
    billTo: "Para",
    issueDate: "Fecha de emisión",
    dueDate: "Fecha de vencimiento",
    items: "Conceptos",
    description: "Descripción",
    qty: "Cant.",
    unitPrice: "Precio unitario",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Impuestos",
    notes: "Notas",
    payNow: "Pagar ahora",
    noEmail: "Sin email",
    noItems: "No hay conceptos en esta factura.",
    paid: "Pagada",
    pending: "Pendiente",
    canceled: "Cancelada",
  },
  en: {
    title: "Public invoice",
    invoice: "Invoice",
    status: "Status",
    from: "From",
    billTo: "Bill to",
    issueDate: "Issue date",
    dueDate: "Due date",
    items: "Items",
    description: "Description",
    qty: "Qty",
    unitPrice: "Unit price",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Tax",
    notes: "Notes",
    payNow: "Pay now",
    noEmail: "No email",
    noItems: "There are no items in this invoice.",
    paid: "Paid",
    pending: "Pending",
    canceled: "Canceled",
  },
} as const;

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(value || 0);
}

function translateStatus(status: string | null, lang: "es" | "en") {
  const value = (status || "").toLowerCase();
  if (value === "paid") return lang === "es" ? "Pagada" : "Paid";
  if (value === "canceled") return lang === "es" ? "Cancelada" : "Canceled";
  return lang === "es" ? "Pendiente" : "Pending";
}

function statusClasses(status: string | null) {
  const value = (status || "").toLowerCase();
  if (value === "paid") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (value === "canceled") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

export default async function PublicInvoicePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams?: SearchParams;
}) {
  const { token } = await params;
  const sp = (await searchParams) ?? {};
  const lang = sp.lang === "en" ? "en" : "es";
  const t = translations[lang];

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: invoice, error: invoiceError } = await admin
    .from("invoices")
    .select(
      "id, invoice_number, client_name, client_email, status, total, subtotal, tax, currency, issue_date, due_date, notes"
    )
    .eq("public_token", token)
    .single<InvoiceRow>();

  if (invoiceError || !invoice) {
    notFound();
  }

  const { data: itemsData } = await admin
    .from("invoice_items")
    .select("id, description, quantity, unit_price, total")
    .eq("invoice_id", invoice.id)
    .order("id", { ascending: true });

  const items = (itemsData || []) as InvoiceItemRow[];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_45%,_#ffffff_100%)] px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{t.invoice}</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                {invoice.invoice_number || "—"}
              </h1>
              <p className="mt-3 text-sm text-slate-500">{t.title}</p>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <div>
                <p className="text-sm font-medium text-slate-500">{t.status}</p>
                <span
                  className={`mt-2 inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${statusClasses(
                    invoice.status
                  )}`}
                >
                  {translateStatus(invoice.status, lang)}
                </span>
              </div>

              {(invoice.status || "").toLowerCase() !== "paid" ? (
                <Link
                  href={`/public-invoice/${token}/pay?lang=${lang}`}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  {t.payNow}
                </Link>
              ) : null}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {t.from}
              </p>
              <p className="mt-3 text-lg font-bold text-slate-950">Tadeo Invoices</p>
              <p className="mt-2 text-sm text-slate-500">billing@tadeoinvoices.com</p>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {t.billTo}
              </p>
              <p className="mt-3 text-lg font-bold text-slate-950">
                {invoice.client_name || "—"}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {invoice.client_email || t.noEmail}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5">
              <p className="text-sm font-medium text-slate-500">{t.issueDate}</p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {invoice.issue_date
                  ? new Date(invoice.issue_date).toLocaleDateString()
                  : "—"}
              </p>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5">
              <p className="text-sm font-medium text-slate-500">{t.dueDate}</p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {invoice.due_date
                  ? new Date(invoice.due_date).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-[28px] border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <h2 className="text-xl font-bold text-slate-950">{t.items}</h2>
            </div>

            {items.length === 0 ? (
              <div className="px-5 py-8 text-sm text-slate-500">{t.noItems}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[760px] w-full text-left">
                  <thead className="bg-slate-50">
                    <tr className="text-sm text-slate-500">
                      <th className="px-6 py-4 font-semibold">{t.description}</th>
                      <th className="px-6 py-4 font-semibold">{t.qty}</th>
                      <th className="px-6 py-4 font-semibold">{t.unitPrice}</th>
                      <th className="px-6 py-4 font-semibold">{t.total}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-t border-slate-100 text-sm text-slate-700">
                        <td className="px-6 py-4">{item.description || "—"}</td>
                        <td className="px-6 py-4">{item.quantity || 0}</td>
                        <td className="px-6 py-4">
                          {money(Number(item.unit_price || 0), invoice.currency || "USD")}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-950">
                          {money(Number(item.total || 0), invoice.currency || "USD")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-8 ml-auto w-full max-w-md space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4">
              <span className="text-sm text-slate-500">{t.subtotal}</span>
              <span className="font-semibold text-slate-950">
                {money(Number(invoice.subtotal || 0), invoice.currency || "USD")}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4">
              <span className="text-sm text-slate-500">{t.tax}</span>
              <span className="font-semibold text-slate-950">
                {money(Number(invoice.tax || 0), invoice.currency || "USD")}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-950 px-5 py-4 text-white">
              <span className="text-sm">{t.total}</span>
              <span className="text-lg font-bold">
                {money(Number(invoice.total || 0), invoice.currency || "USD")}
              </span>
            </div>
          </div>

          {invoice.notes ? (
            <div className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-lg font-bold text-slate-950">{t.notes}</h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {invoice.notes}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}