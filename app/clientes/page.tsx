import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

type InvoiceRow = {
  client_name: string | null;
  client_email: string | null;
  total: number | null;
};

type ClienteResumen = {
  client_name: string;
  client_email: string | null;
  total_facturado: number;
  facturas: number;
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}

export default async function ClientesPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = (await searchParams) ?? {};
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
    .select("client_name, client_email, total")
    .eq("user_id", user.id)
    .order("client_name", { ascending: true });

  if (error) {
    console.error("CLIENTES_LOAD_ERROR", error);
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
            <p className="mt-2 text-red-600">
              No se pudieron cargar los clientes.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const invoices = (data || []) as InvoiceRow[];

  const grouped = new Map<string, ClienteResumen>();

  for (const invoice of invoices) {
    const name = (invoice.client_name || "Cliente sin nombre").trim();
    const email = invoice.client_email?.trim() || null;
    const key = email || name.toLowerCase();

    if (!grouped.has(key)) {
      grouped.set(key, {
        client_name: name,
        client_email: email,
        total_facturado: 0,
        facturas: 0,
      });
    }

    const current = grouped.get(key)!;
    current.total_facturado += Number(invoice.total || 0);
    current.facturas += 1;
  }

  let clientes = Array.from(grouped.values()).sort(
    (a, b) => b.total_facturado - a.total_facturado
  );

  if (query) {
    clientes = clientes.filter((cliente) => {
      const haystack = `${cliente.client_name} ${cliente.client_email || ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }

  const totalClientes = clientes.length;
  const totalFacturado = clientes.reduce(
    (sum, cliente) => sum + cliente.total_facturado,
    0
  );
  const totalFacturas = clientes.reduce(
    (sum, cliente) => sum + cliente.facturas,
    0
  );
  const promedioPorCliente =
    totalClientes > 0 ? totalFacturado / totalClientes : 0;

  const topCliente = clientes[0] || null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_40%,_#ffffff_100%)] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-700">
                Gestión de clientes
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
                Clientes
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-slate-600 md:text-base">
                Visualiza tus clientes, cuánto te han facturado en total y quiénes
                son los más valiosos para tu negocio.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/invoice/new"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                + Nueva factura
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Volver al dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total de clientes</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{totalClientes}</p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total facturado</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {money(totalFacturado)}
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Facturas totales</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{totalFacturas}</p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Promedio por cliente</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {money(promedioPorCliente)}
            </p>
          </div>
        </div>

        <div className="mb-8 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <form className="flex flex-col gap-3 md:flex-row">
              <input
                type="text"
                name="q"
                defaultValue={params.q || ""}
                placeholder="Buscar por nombre o email..."
                className="h-12 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
              />
              <button
                type="submit"
                className="h-12 rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Buscar
              </button>
              <Link
                href="/clientes"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Limpiar
              </Link>
            </form>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <p className="text-sm font-medium text-slate-500">Cliente top</p>
            {topCliente ? (
              <>
                <p className="mt-3 text-xl font-bold text-slate-950">
                  {topCliente.client_name}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {topCliente.client_email || "Sin email"}
                </p>
                <p className="mt-4 text-2xl font-bold text-emerald-600">
                  {money(topCliente.total_facturado)}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {topCliente.facturas} factura
                  {topCliente.facturas === 1 ? "" : "s"}
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                Aún no tienes clientes registrados.
              </p>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-bold text-slate-950">
              Lista de clientes
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Vista agrupada a partir de tus facturas.
            </p>
          </div>

          {clientes.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto max-w-md">
                <h3 className="text-xl font-bold text-slate-900">
                  No hay clientes todavía
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Cuando crees facturas, aquí aparecerán tus clientes
                  automáticamente.
                </p>
                <Link
                  href="/invoice/new"
                  className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Crear primera factura
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50">
                  <tr className="text-sm text-slate-500">
                    <th className="px-6 py-4 font-semibold">Cliente</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Facturas</th>
                    <th className="px-6 py-4 font-semibold">Total facturado</th>
                    <th className="px-6 py-4 font-semibold">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente, index) => (
                    <tr
                      key={`${cliente.client_email || cliente.client_name}-${index}`}
                      className="border-t border-slate-100 text-sm text-slate-700"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {cliente.client_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {cliente.client_email || "Sin email"}
                      </td>
                      <td className="px-6 py-4">
                        {cliente.facturas}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-950">
                        {money(cliente.total_facturado)}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href="/invoice/new"
                          className="inline-flex rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Crear factura
                        </Link>
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