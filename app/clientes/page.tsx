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
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-6">
        <div className="mx-auto w-full max-w-7xl">
          <div className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
            <p className="mt-2 text-sm text-red-600">
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
      const text = `${cliente.client_name} ${cliente.client_email || ""}`.toLowerCase();
      return text.includes(query);
    });
  }

  const totalClientes = clientes.length;
  const totalFacturado = clientes.reduce(
    (sum, cliente) => sum + cliente.total_facturado,
    0
  );
  const totalFacturas = clientes.reduce((sum, c) => sum + c.facturas, 0);
  const promedioPorCliente =
    totalClientes > 0 ? totalFacturado / totalClientes : 0;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_45%,_#ffffff_100%)] px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                Gestión de clientes
              </p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                Clientes
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                Visualiza tus clientes y cuánto te han facturado en total.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/invoice/new"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                + Nueva factura
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Volver al dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total de clientes</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {totalClientes}
            </p>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total facturado</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {money(totalFacturado)}
            </p>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Facturas</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {totalFacturas}
            </p>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Promedio por cliente</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {money(promedioPorCliente)}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <form className="flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              name="q"
              defaultValue={params.q || ""}
              placeholder="Buscar por nombre o email..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
            />
            <button
              type="submit"
              className="h-12 rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white"
            >
              Buscar
            </button>
            <Link
              href="/clientes"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700"
            >
              Limpiar
            </Link>
          </form>
        </div>

        <div className="mt-6 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <h2 className="text-xl font-bold text-slate-950">
              Lista de clientes
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Vista agrupada a partir de tus facturas.
            </p>
          </div>

          {clientes.length === 0 ? (
            <div className="px-5 py-14 text-center sm:px-6">
              <h3 className="text-xl font-bold text-slate-900">
                No hay clientes todavía
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Cuando crees facturas, aquí aparecerán automáticamente.
              </p>
              <Link
                href="/invoice/new"
                className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                Crear primera factura
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full text-left">
                <thead className="bg-slate-50">
                  <tr className="text-sm text-slate-500">
                    <th className="px-6 py-4 font-semibold">Cliente</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Facturas</th>
                    <th className="px-6 py-4 font-semibold">Total</th>
                    <th className="px-6 py-4 font-semibold">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente, index) => (
                    <tr
                      key={`${cliente.client_email || cliente.client_name}-${index}`}
                      className="border-t border-slate-100 text-sm text-slate-700"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-950">
                        {cliente.client_name}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {cliente.client_email || "Sin email"}
                      </td>
                      <td className="px-6 py-4">{cliente.facturas}</td>
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