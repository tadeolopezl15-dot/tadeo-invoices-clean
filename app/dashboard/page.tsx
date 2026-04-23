import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(value || 0);
}

function statusClass(status: string | null) {
  const value = (status || "").toLowerCase();
  if (value === "paid") return "ui-pill ui-pill-paid";
  if (value === "canceled") return "ui-pill ui-pill-canceled";
  return "ui-pill ui-pill-pending";
}

export default async function DashboardPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, client_name, client_email, status, total, currency, issue_date, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const allInvoices = invoices || [];
  const currency = allInvoices[0]?.currency || "USD";

  const totalInvoices = allInvoices.length;

  const totalBilled = allInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.total || 0),
    0
  );

  const totalPaid = allInvoices
    .filter((invoice) => (invoice.status || "").toLowerCase() === "paid")
    .reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);

  const totalPending = allInvoices
    .filter((invoice) => (invoice.status || "").toLowerCase() === "pending")
    .reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);

  const clientKeys = new Set(
    allInvoices.map(
      (invoice) => `${invoice.client_name || ""}__${invoice.client_email || ""}`
    )
  );

  const totalClients = clientKeys.size;

  const recentInvoices = allInvoices.slice(0, 6);

  return (
    <main className="ui-page">
      <AppHeader />

      <div className="ui-shell">
        <section className="ui-card p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="ui-badge">Dashboard</div>
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
                Control total de tu facturación
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 md:text-xl">
                Mira tus ingresos, tus facturas recientes y el estado real de tu negocio
                desde una sola vista.
              </p>
            </div>

            <div className="ui-actions">
              <Link href="/invoice/new" className="btn btn-primary">
                Crear factura
              </Link>
              <Link href="/invoice" className="btn btn-secondary">
                Ver facturas
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="ui-panel">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              Total facturado
            </p>
            <p className="mt-4 text-3xl font-extrabold text-slate-950">
              {money(totalBilled, currency)}
            </p>
          </div>

          <div className="ui-panel">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              Total pagado
            </p>
            <p className="mt-4 text-3xl font-extrabold text-emerald-600">
              {money(totalPaid, currency)}
            </p>
          </div>

          <div className="ui-panel">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              Total pendiente
            </p>
            <p className="mt-4 text-3xl font-extrabold text-amber-600">
              {money(totalPending, currency)}
            </p>
          </div>

          <div className="ui-panel">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              Clientes
            </p>
            <p className="mt-4 text-3xl font-extrabold text-slate-950">
              {totalClients}
            </p>
          </div>
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="ui-panel">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              Facturas
            </p>
            <p className="mt-4 text-3xl font-extrabold text-slate-950">
              {totalInvoices}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Cantidad total de facturas creadas.
            </p>
          </div>

          <div className="ui-panel">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              Conversión de pago
            </p>
            <p className="mt-4 text-3xl font-extrabold text-slate-950">
              {totalInvoices > 0
                ? `${Math.round(
                    (allInvoices.filter(
                      (invoice) => (invoice.status || "").toLowerCase() === "paid"
                    ).length /
                      totalInvoices) *
                      100
                  )}%`
                : "0%"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Porcentaje de facturas marcadas como pagadas.
            </p>
          </div>
        </section>

        <section className="mt-6 ui-card p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Facturas recientes
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Últimos movimientos de tu cuenta.
              </p>
            </div>

            <Link href="/invoice" className="btn btn-secondary">
              Ver todas
            </Link>
          </div>

          {recentInvoices.length === 0 ? (
            <div className="ui-panel-soft text-center">
              <p className="text-base text-slate-600">
                Aún no tienes facturas. Crea la primera para ver tus métricas.
              </p>
              <div className="mt-5">
                <Link href="/invoice/new" className="btn btn-primary">
                  Crear factura
                </Link>
              </div>
            </div>
          ) : (
            <div className="ui-table-wrap">
              <div className="overflow-x-auto">
                <table className="ui-table min-w-[900px]">
                  <thead>
                    <tr>
                      <th>Factura</th>
                      <th>Cliente</th>
                      <th>Estado</th>
                      <th>Total</th>
                      <th>Fecha</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInvoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="font-semibold text-slate-950">
                          {invoice.invoice_number || "—"}
                        </td>
                        <td>
                          <div>
                            <p className="font-medium text-slate-900">
                              {invoice.client_name || "—"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {invoice.client_email || "Sin email"}
                            </p>
                          </div>
                        </td>
                        <td>
                          <span className={statusClass(invoice.status)}>
                            {invoice.status || "pending"}
                          </span>
                        </td>
                        <td className="font-semibold text-slate-950">
                          {money(Number(invoice.total || 0), invoice.currency || currency)}
                        </td>
                        <td className="text-slate-600">
                          {invoice.issue_date
                            ? new Date(invoice.issue_date).toLocaleDateString()
                            : "—"}
                        </td>
                        <td>
                          <Link
                            href={`/invoice/${invoice.id}`}
                            className="btn btn-secondary"
                          >
                            Ver
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}