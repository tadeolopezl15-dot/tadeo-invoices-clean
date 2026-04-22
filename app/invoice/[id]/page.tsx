import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getServerLang } from "@/lib/server-lang";
import DeleteInvoiceButton from "@/components/invoice/DeleteInvoiceButton";
import SendInvoiceEmailButton from "@/components/invoice/SendInvoiceEmailButton";

type Params = Promise<{ id: string }>;

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
  public_token?: string | null;
};

type InvoiceItemRow = {
  id: string;
  description: string | null;
  quantity: number | null;
  unit_price: number | null;
  total: number | null;
};

type ProfileRow = {
  company_name: string | null;
  company_email: string | null;
  company_phone: string | null;
  company_address: string | null;
  logo_url: string | null;
};

const translations = {
  es: {
    back: "Volver",
    edit: "Editar",
    publicView: "Vista pública",
    invoiceNumber: "Factura",
    status: "Estado",
    from: "De",
    billTo: "Para",
    issueDate: "Fecha de emisión",
    dueDate: "Fecha de vencimiento",
    noEmail: "Sin email",
    items: "Conceptos",
    description: "Descripción",
    qty: "Cant.",
    unitPrice: "Precio unitario",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Impuestos",
    notes: "Notas",
    email: "Enviar email",
    emailSent: "Email enviado",
    emailError: "No se pudo enviar",
    delete: "Eliminar",
    noItems: "No hay conceptos en esta factura.",
    defaultCompany: "Tadeo Invoices",
    defaultCompanyEmail: "billing@tadeoinvoices.com",
    paid: "Pagada",
    pending: "Pendiente",
    canceled: "Cancelada",
  },
  en: {
    back: "Back",
    edit: "Edit",
    publicView: "Public view",
    invoiceNumber: "Invoice",
    status: "Status",
    from: "From",
    billTo: "Bill to",
    issueDate: "Issue date",
    dueDate: "Due date",
    noEmail: "No email",
    items: "Items",
    description: "Description",
    qty: "Qty",
    unitPrice: "Unit price",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Tax",
    notes: "Notes",
    email: "Send email",
    emailSent: "Email sent",
    emailError: "Could not send",
    delete: "Delete",
    noItems: "There are no items in this invoice.",
    defaultCompany: "Tadeo Invoices",
    defaultCompanyEmail: "billing@tadeoinvoices.com",
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

  if (value === "paid") return translations[lang].paid;
  if (value === "canceled") return translations[lang].canceled;
  return translations[lang].pending;
}

function statusClasses(status: string | null) {
  const value = (status || "").toLowerCase();

  if (value === "paid") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (value === "canceled") {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }

  return "bg-amber-50 text-amber-700 border-amber-200";
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const lang = await getServerLang();
  const t = translations[lang];

  const supabase = await createServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, client_name, client_email, status, total, subtotal, tax, currency, issue_date, due_date, notes, public_token"
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single<InvoiceRow>();

  if (invoiceError || !invoice) {
    notFound();
  }

  const { data: itemsData, error: itemsError } = await supabase
    .from("invoice_items")
    .select("id, description, quantity, unit_price, total")
    .eq("invoice_id", invoice.id)
    .order("id", { ascending: true });

  if (itemsError) {
    console.error("INVOICE_ITEMS_LOAD_ERROR", itemsError);
  }

  const items = (itemsData || []) as InvoiceItemRow[];

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("company_name, company_email, company_phone, company_address, logo_url")
    .eq("id", user.id)
    .single<ProfileRow>();

  if (profileError) {
    console.error("INVOICE_PROFILE_LOAD_ERROR", profileError);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_45%,_#ffffff_100%)] px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <Link
            href="/invoice"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
          >
            {t.back}
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={`/invoice/${invoice.id}/edit`}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
            >
              {t.edit}
            </Link>

            <Link
              href={`/api/invoices/${invoice.id}/pdf`}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
            >
              PDF
            </Link>

            <SendInvoiceEmailButton
              invoiceId={invoice.id}
              label={t.email}
              successLabel={t.emailSent}
              errorLabel={t.emailError}
            />

            <DeleteInvoiceButton
              action={`/api/invoices/${invoice.id}/delete`}
              label={t.delete}
            />

            {invoice.public_token ? (
              <Link
                href={`/public-invoice/${invoice.public_token}`}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                {t.publicView}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              {profile?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.logo_url}
                  alt="Logo"
                  className="max-h-[90px] w-auto object-contain"
                />
              ) : null}

              <div>
                <p className="text-sm font-medium text-slate-500">
                  {t.invoiceNumber}
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                  {invoice.invoice_number || "—"}
                </h1>
              </div>
            </div>

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
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {t.from}
              </p>
              <p className="mt-3 text-lg font-bold text-slate-950">
                {profile?.company_name || t.defaultCompany}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {profile?.company_email || t.defaultCompanyEmail}
              </p>
              {profile?.company_phone ? (
                <p className="mt-1 text-sm text-slate-500">
                  {profile.company_phone}
                </p>
              ) : null}
              {profile?.company_address ? (
                <p className="mt-1 text-sm text-slate-500">
                  {profile.company_address}
                </p>
              ) : null}
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
              <p className="text-sm font-medium text-slate-500">
                {t.issueDate}
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {invoice.issue_date
                  ? new Date(invoice.issue_date).toLocaleDateString()
                  : "—"}
              </p>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5">
              <p className="text-sm font-medium text-slate-500">
                {t.dueDate}
              </p>
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
              <div className="px-5 py-8 text-sm text-slate-500">
                {t.noItems}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[760px] w-full text-left">
                  <thead className="bg-slate-50">
                    <tr className="text-sm text-slate-500">
                      <th className="px-6 py-4 font-semibold">
                        {t.description}
                      </th>
                      <th className="px-6 py-4 font-semibold">{t.qty}</th>
                      <th className="px-6 py-4 font-semibold">
                        {t.unitPrice}
                      </th>
                      <th className="px-6 py-4 font-semibold">{t.total}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-slate-100 text-sm text-slate-700"
                      >
                        <td className="px-6 py-4">{item.description || "—"}</td>
                        <td className="px-6 py-4">{item.quantity || 0}</td>
                        <td className="px-6 py-4">
                          {money(
                            Number(item.unit_price || 0),
                            invoice.currency || "USD"
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-950">
                          {money(
                            Number(item.total || 0),
                            invoice.currency || "USD"
                          )}
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
                {money(
                  Number(invoice.subtotal || 0),
                  invoice.currency || "USD"
                )}
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