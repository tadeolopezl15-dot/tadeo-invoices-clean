import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

type SearchParams = Promise<{ lang?: "es" | "en" }>;

type InvoiceRow = {
  id: string;
  total: number | null;
  status: string | null;
  client_name: string | null;
  created_at?: string | null;
};

const translations = {
  es: {
    badge: "Panel principal",
    title: "Administra tu negocio desde un solo lugar",
    subtitle:
      "Controla facturas, clientes, ingresos y pagos con una experiencia moderna, limpia y profesional.",
    createInvoice: "Crear factura",
    viewClients: "Ver clientes",
    totalInvoices: "Facturas totales",
    totalClients: "Clientes",
    totalRevenue: "Ingresos",
    pending: "Pendientes",
    quickAccess: "Accesos rápidos",
    quickAccessText:
      "Navega rápido entre las secciones más importantes de tu app.",
    invoices: "Facturas",
    reports: "Reportes",
    memberships: "Membresías",
    settings: "Configuración",
    recentInvoices: "Facturas recientes",
    recentInvoicesText: "Últimas facturas registradas en tu cuenta.",
    client: "Cliente",
    status: "Estado",
    amount: "Monto",
    noInvoices: "Aún no tienes facturas registradas.",
    createFirstInvoice: "Crear primera factura",
    paid: "Pagada",
    pendingStatus: "Pendiente",
    canceled: "Cancelada",
    viewAll: "Ver todas",
  },
  en: {
    badge: "Main dashboard",
    title: "Manage your business from one place",
    subtitle:
      "Control invoices, clients, revenue, and payments with a modern, clean, and professional experience.",
    createInvoice: "Create invoice",
    viewClients: "View clients",
    totalInvoices: "Total invoices",
    totalClients: "Clients",
    totalRevenue: "Revenue",
    pending: "Pending",
    quickAccess: "Quick access",
    quickAccessText:
      "Move quickly between the most important sections of your app.",
    invoices: "Invoices",
    reports: "Reports",
    memberships: "Memberships",
    settings: "Settings",
    recentInvoices: "Recent invoices",
    recentInvoicesText: "Latest invoices registered in your account.",
    client: "Client",
    status: "Status",
    amount: "Amount",
    noInvoices: "You do not have any invoices yet.",
    createFirstInvoice: "Create first invoice",
    paid: "Paid",
    pendingStatus: "Pending",
    canceled: "Canceled",
    viewAll: "View all",
  },
} as const;

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}

function translateStatus(status: string | null, lang: "es" | "en") {
  const value = (status || "").toLowerCase();

  if (value === "paid") {
    return lang === "es" ? "Pagada" : "Paid";
  }

  if (value === "canceled") {
    return lang === "es" ? "Cancelada" : "Canceled";
  }

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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = (await searchParams) ?? {};
  const lang = params.lang === "en" ? "en" : "es";
  const t = translations[lang];

  const supabase = await createServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: invoicesData, error: invoicesError } = await supabase
    .from("invoices")
    .select("id, total, status, client_name, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (invoicesError) {
    console.error("DASHBOARD_INVOICES_ERROR", invoicesError);
  }

  const invoices = (invoicesData || []) as InvoiceRow[];

  const totalInvoices = invoices.length;
  const totalRevenue = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.total || 0),
    0
  );
  const pendingInvoices = invoices.filter(
    (invoice) => (invoice.status || "").toLowerCase() !== "paid"
  ).length;

  const uniqueClients = new Set(
    invoices
      .map((invoice) => (invoice.client_name || "").trim())
      .filter(Boolean)
  ).size;

  const recentInvoices = invoices.slice(0, 5);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_45%,_#ffffff_100%)] px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
            {t.badge}
          </p>

          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
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
                {t.createInvoice}
              </Link>
              <Link
                href="/clientes"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
              >
                {t.viewClients}
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
            <p className="text-sm text-slate-500">{t.totalClients}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {uniqueClients}
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{t.totalRevenue}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {money(totalRevenue)}
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{t.pending}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {pendingInvoices}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-950">
              {t.quickAccess}
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600 md:text-base">
              {t.quickAccessText}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Link
                href="/invoice"
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:bg-white hover:shadow-sm"
              >
                <p className="text-lg font-semibold text-slate-950">
                  {t.invoices}
                </p>
              </Link>

              <Link
                href="/reportes"
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:bg-white hover:shadow-sm"
              >
                <p className="text-lg font-semibold text-slate-950">
                  {t.reports}
                </p>
              </Link>

              <Link
                href="/pricing"
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:bg-white hover:shadow-sm"
              >
                <p className="text-lg font-semibold text-slate-950">
                  {t.memberships}
                </p>
              </Link>

              <Link
                href="/configuracion"
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:bg-white hover:shadow-sm"
              >
                <p className="text-lg font-semibold text-slate-950">
                  {t.settings}
                </p>
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  {t.recentInvoices}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {t.recentInvoicesText}
                </p>
              </div>

              <Link
                href="/invoice"
                className="text-sm font-semibold text-blue-700 transition hover:text-blue-800"
              >
                {t.viewAll}
              </Link>
            </div>

            {recentInvoices.length === 0 ? (
              <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-6 text-center">
                <p className="text-sm text-slate-600">{t.noInvoices}</p>
                <Link
                  href="/invoice/new"
                  className="mt-4 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  {t.createFirstInvoice}
                </Link>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {recentInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-950">
                          {invoice.client_name || "Cliente"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {t.amount}: {money(Number(invoice.total || 0))}
                        </p>
                      </div>

                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(
                          invoice.status
                        )}`}
                      >
                        {translateStatus(invoice.status, lang)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}