import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

type SearchParams = Promise<{ q?: string; lang?: "es" | "en" }>;

type InvoiceRow = {
  id: string;
  invoice_number: string | null;
  client_name: string | null;
  client_email: string | null;
  status: string | null;
  total: number | null;
  currency: string | null;
  issue_date: string | null;
};

const translations = {
  es: {
    badge: "Facturas",
    title: "Administra tus facturas",
    subtitle:
      "Consulta, abre y organiza tus facturas desde una vista profesional y responsive.",
    newInvoice: "Nueva factura",
    backDashboard: "Volver al dashboard",
    searchPlaceholder: "Buscar por cliente, email o número...",
    search: "Buscar",
    clear: "Limpiar",
    number: "Número",
    client: "Cliente",
    email: "Email",
    status: "Estado",
    amount: "Monto",
    issueDate: "Fecha",
    action: "Acción",
    view: "Ver",
    edit: "Editar",
    noInvoices: "No tienes facturas todavía",
    noInvoicesText:
      "Crea tu primera factura para comenzar a organizar tu facturación.",
    createFirstInvoice: "Crear primera factura",
    paid: "Pagada",
    pending: "Pendiente",
    canceled: "Cancelada",
    totalInvoices: "Facturas totales",
    paidInvoices: "Pagadas",
    pendingInvoices: "Pendientes",
    totalRevenue: "Total facturado",
    noEmail: "Sin email",
  },
  en: {
    badge: "Invoices",
    title: "Manage your invoices",
    subtitle:
      "Review, open, and organize your invoices from a professional responsive view.",
    newInvoice: "New invoice",
    backDashboard: "Back to dashboard",
    searchPlaceholder: "Search by client, email, or invoice number...",
    search: "Search",
    clear: "Clear",
    number: "Number",
    client: "Client",
    email: "Email",
    status: "Status",
    amount: "Amount",
    issueDate: "Date",
    action: "Action",
    view: "View",
    edit: "Edit",
    noInvoices: "You do not have invoices yet",
    noInvoicesText:
      "Create your first invoice to start organizing your billing.",
    createFirstInvoice: "Create first invoice",
    paid: "Paid",
    pending: "Pending",
    canceled: "Canceled",
    totalInvoices: "Total invoices",
    paidInvoices: "Paid",
    pendingInvoices: "Pending",
    totalRevenue: "Total billed",
    noEmail: "No email",
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

  if (value === "paid") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (value === "canceled") {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  return "bg-amber-50 text-amber-700 border-amber-200";
}

export default async function InvoiceListPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = (await searchParams) ?? {};
  const lang = params.lang === "en" ? "en" : "es";
  const t = translations[lang];
  const query = (params.q || "").trim().toLowerCase();

  const supabase = await createServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, client_name, client_email, status, total, currency, issue_date"
    )
    .eq("user_id", user.id)
    .order("issue_date", { ascending: false });

  if (error) {
    console.error("INVOICE_LIST_ERROR", error);
  }

  let invoices = (data || []) as InvoiceRow[];

  if (query) {
    invoices = invoices.filter((invoice) => {
      const haystack = `${invoice.invoice_number || ""} ${invoice.client_name || ""} ${invoice.client_email || ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }

  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(
    (invoice) => (invoice.status || "").toLowerCase() === "paid"
  ).length;
  const pendingInvoices = invoices.filter(
    (invoice) => (invoice.status || "").toLowerCase() !== "paid"
  ).length;
  const totalRevenue = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.total || 0),
    0
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_45%,_#ffffff_100%)] px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                {t.badge}
              </p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                {t.title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                {t.subtitle}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/invoice/new"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                {t.newInvoice}
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
              >
                {t.backDashboard}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{t.totalInvoices}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {totalInvoices}
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{t.paidInvoices}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {paidInvoices}
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{t.pendingInvoices}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {pendingInvoices}
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{t.totalRevenue}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {money(totalRevenue)}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <form className="flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              name="q"
              defaultValue={params.q || ""}
              placeholder={t.searchPlaceholder}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
            />
            <button
              type="submit"
              className="h-12 rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white"
            >
              {t.search}
            </button>
            <Link
              href={`/invoice?lang=${lang}`}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700"
            >
              {t.clear}
            </Link>
          </form>
        </div>

        <div className="mt-6 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <h2 className="text-xl font-bold text-slate-950">{t.badge}</h2>
          </div>

          {invoices.length === 0 ? (
            <div className="px-5 py-14 text-center sm:px-6">
              <h3 className="text-xl font-bold text-slate-900">
                {t.noInvoices}
              </h3>
              <p className="mt-2 text-sm text-slate-500">{t.noInvoicesText}</p>
              <Link
                href="/invoice/new"
                className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                {t.createFirstInvoice}
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full text-left">
                <thead className="bg-slate-50">
                  <tr className="text-sm text-slate-500">
                    <th className="px-6 py-4 font-semibold">{t.number}</th>
                    <th className="px-6 py-4 font-semibold">{t.client}</th>
                    <th className="px-6 py-4 font-semibold">{t.email}</th>
                    <th className="px-6 py-4 font-semibold">{t.status}</th>
                    <th className="px-6 py-4 font-semibold">{t.amount}</th>
                    <th className="px-6 py-4 font-semibold">{t.issueDate}</th>
                    <th className="px-6 py-4 font-semibold">{t.action}</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-t border-slate-100 text-sm text-slate-700"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-950">
                        {invoice.invoice_number || "—"}
                      </td>
                      <td className="px-6 py-4 text-slate-900">
                        {invoice.client_name || "—"}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {invoice.client_email || t.noEmail}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(
                            invoice.status
                          )}`}
                        >
                          {translateStatus(invoice.status, lang)}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-950">
                        {money(
                          Number(invoice.total || 0),
                          invoice.currency || "USD"
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {invoice.issue_date
                          ? new Date(invoice.issue_date).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/invoice/${invoice.id}?lang=${lang}`}
                            className="inline-flex rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            {t.view}
                          </Link>
                          <Link
                            href={`/invoice/${invoice.id}/edit?lang=${lang}`}
                            className="inline-flex rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                          >
                            {t.edit}
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}