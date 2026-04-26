import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";

export default async function AdminPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, plan, subscription_status, company_name, company_email")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: users } = await supabase
    .from("profiles")
    .select(
      "id, full_name, company_name, company_email, role, plan, subscription_status, created_at"
    )
    .order("created_at", { ascending: false });

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, client_name, status, total, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <main className="ui-page">
      <AppHeader />

      <div className="ui-shell">
        <section className="ui-card p-6 md:p-8">
          <div className="ui-badge">Admin</div>

          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
            Panel de administrador
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 md:text-xl">
            Acceso completo para revisar usuarios, planes, facturas y estado del
            sistema.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              Rol: {profile?.role || "member"}
            </span>

            <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              Plan: {profile?.plan || "free"}
            </span>

            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              Estado: {profile?.subscription_status || "active"}
            </span>
          </div>

          <div className="ui-actions mt-8">
            <Link href="/dashboard" className="btn btn-secondary">
              Dashboard
            </Link>

            <Link href="/invoice" className="btn btn-secondary">
              Facturas
            </Link>

            <Link href="/configuracion" className="btn btn-primary">
              Configuración
            </Link>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="ui-panel">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              Usuarios
            </p>
            <p className="mt-4 text-3xl font-extrabold text-slate-950">
              {users?.length || 0}
            </p>
          </div>

          <div className="ui-panel">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              Facturas recientes
            </p>
            <p className="mt-4 text-3xl font-extrabold text-slate-950">
              {invoices?.length || 0}
            </p>
          </div>

          <div className="ui-panel">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              Acceso
            </p>
            <p className="mt-4 text-3xl font-extrabold text-emerald-600">
              Full
            </p>
          </div>
        </section>

        <section className="mt-6 ui-card p-4 md:p-6">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-slate-950">
            Usuarios
          </h2>

          <div className="ui-table-wrap">
            <div className="overflow-x-auto">
              <table className="ui-table min-w-[1000px]">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Empresa</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Plan</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {(users || []).map((item) => (
                    <tr key={item.id}>
                      <td className="font-semibold text-slate-950">
                        {item.full_name || "—"}
                      </td>
                      <td>{item.company_name || "—"}</td>
                      <td>{item.company_email || "—"}</td>
                      <td>{item.role || "member"}</td>
                      <td>{item.plan || "free"}</td>
                      <td>{item.subscription_status || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mt-6 ui-card p-4 md:p-6">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-slate-950">
            Últimas facturas
          </h2>

          <div className="ui-table-wrap">
            <div className="overflow-x-auto">
              <table className="ui-table min-w-[900px]">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Cliente</th>
                    <th>Estado</th>
                    <th>Total</th>
                    <th>Ver</th>
                  </tr>
                </thead>

                <tbody>
                  {(invoices || []).map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="font-semibold text-slate-950">
                        {invoice.invoice_number || "—"}
                      </td>
                      <td>{invoice.client_name || "—"}</td>
                      <td>{invoice.status || "pending"}</td>
                      <td>${Number(invoice.total || 0).toFixed(2)}</td>
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
        </section>
      </div>
    </main>
  );
}