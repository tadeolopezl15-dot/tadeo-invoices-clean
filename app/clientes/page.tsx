import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";

type ClientRow = {
  client_name: string | null;
  client_email: string | null;
  total: number | null;
  currency: string | null;
};

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(value || 0);
}

export default async function ClientesPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: invoices } = await supabase
    .from("invoices")
    .select("client_name, client_email, total, currency")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const grouped = new Map<
    string,
    {
      client_name: string | null;
      client_email: string | null;
      invoices_count: number;
      total_billed: number;
      currency: string | null;
    }
  >();

  for (const row of (invoices || []) as ClientRow[]) {
    const key = `${row.client_name || ""}__${row.client_email || ""}`;
    const current = grouped.get(key);

    if (current) {
      current.invoices_count += 1;
      current.total_billed += Number(row.total || 0);
    } else {
      grouped.set(key, {
        client_name: row.client_name,
        client_email: row.client_email,
        invoices_count: 1,
        total_billed: Number(row.total || 0),
        currency: row.currency || "USD",
      });
    }
  }

  const clients = Array.from(grouped.values()).sort(
    (a, b) => b.total_billed - a.total_billed
  );

  return (
    <main className="ui-page">
      <AppHeader />

      <div className="ui-shell">
        <section className="ui-card p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="ui-badge">Clientes</div>
              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
                Clientes
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 md:text-xl">
                Visualiza tus clientes, sus correos y el total facturado en una vista limpia.
              </p>
            </div>

            <div className="ui-actions">
              <Link href="/dashboard" className="btn btn-secondary">
                Dashboard
              </Link>
              <Link href="/invoice/new" className="btn btn-primary">
                Crear factura
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 ui-card p-4 md:p-6">
          {clients.length === 0 ? (
            <div className="ui-panel-soft text-center">
              <p className="text-base text-slate-600">
                Todavía no tienes clientes registrados en tus facturas.
              </p>
            </div>
          ) : (
            <div className="ui-table-wrap">
              <div className="overflow-x-auto">
                <table className="ui-table min-w-[860px]">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Email</th>
                      <th>Facturas</th>
                      <th>Total facturado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client, index) => (
                      <tr key={`${client.client_email}-${index}`}>
                        <td className="font-semibold text-slate-950">
                          {client.client_name || "—"}
                        </td>
                        <td className="text-slate-600">
                          {client.client_email || "—"}
                        </td>
                        <td className="text-slate-700">
                          {client.invoices_count}
                        </td>
                        <td className="font-semibold text-slate-950">
                          {money(client.total_billed, client.currency || "USD")}
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