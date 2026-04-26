import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";

export default async function AdminPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, plan, subscription_status, company_name, company_email")
    .eq("id", user.id)
    .single();

  // 🔒 Solo admin
  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // Datos para panel
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
        {/* HEADER */}
        <section className="ui-card p-6 md:p-8">
          <div className="ui-badge">Admin</div>

          <h1 className="mt-5 text-4xl font-extrabold text-slate-950 md:text-6xl">
            ADMIN NUEVO PRO 🚀
          </h1>

          <p className="mt-4 text-slate-600">
            Control total del sistema, usuarios y facturación.
          </p>

          <div className="mt-6 flex gap-3 flex-wrap">
            <span className="ui-chip">Rol: {profile?.role}</span>
            <span className="ui-chip">Plan: {profile?.plan}</span>
            <span className="ui-chip">
              Estado: {profile?.subscription_status}
            </span>
          </div>

          <div className="mt-6 flex gap-3">
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

        {/* STATS */}
        <section className="grid gap-4 md:grid-cols-3 mt-6">
          <div className="ui-panel">
            <p className="text-sm text-slate-500">Usuarios</p>
            <p className="text-3xl font-bold">{users?.length || 0}</p>
          </div>

          <div className="ui-panel">
            <p className="text-sm text-slate-500">Facturas</p>
            <p className="text-3xl font-bold">{invoices?.length || 0}</p>
          </div>

          <div className="ui-panel">
            <p className="text-sm text-slate-500">Acceso</p>
            <p className="text-3xl font-bold text-emerald-600">FULL</p>
          </div>
        </section>

        {/* USUARIOS */}
        <section className="ui-card mt-6 p-4">
          <h2 className="text-2xl font-bold mb-4">Usuarios</h2>

          <div className="overflow-x-auto">
            <table className="ui-table min-w-[900px]">
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
                {(users || []).map((u) => (
                  <tr key={u.id}>
                    <td>{u.full_name || "-"}</td>
                    <td>{u.company_name || "-"}</td>
                    <td>{u.company_email || "-"}</td>
                    <td>{u.role}</td>
                    <td>{u.plan}</td>
                    <td>{u.subscription_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FACTURAS */}
        <section className="ui-card mt-6 p-4">
          <h2 className="text-2xl font-bold mb-4">Últimas facturas</h2>

          <div className="overflow-x-auto">
            <table className="ui-table min-w-[900px]">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {(invoices || []).map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.invoice_number || "-"}</td>
                    <td>{inv.client_name || "-"}</td>
                    <td>{inv.status}</td>
                    <td>${Number(inv.total || 0).toFixed(2)}</td>
                    <td>
                      <Link
                        href={`/invoice/${inv.id}`}
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
        </section>
      </div>
    </main>
  );
}