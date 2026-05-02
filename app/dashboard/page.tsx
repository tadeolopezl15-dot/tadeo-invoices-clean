import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Invoice = {
  id: string;
  invoice_number?: string | null;
  client_name?: string | null;
  client_email?: string | null;
  total?: number | null;
  status?: string | null;
  currency?: string | null;
  created_at?: string | null;
};

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(value || 0));
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, client_name, client_email, total, status, currency, created_at")
    .order("created_at", { ascending: false });

  const list = (invoices || []) as Invoice[];

  const totalRevenue = list.reduce((sum, i) => sum + Number(i.total || 0), 0);
  const paidRevenue = list
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.total || 0), 0);
  const pendingRevenue = list
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + Number(i.total || 0), 0);

  const paidCount = list.filter((i) => i.status === "paid").length;
  const pendingCount = list.filter((i) => i.status !== "paid").length;
  const totalCount = list.length;
  const averageInvoice = totalCount ? totalRevenue / totalCount : 0;

  const topClients = Object.values(
    list.reduce<Record<string, { name: string; total: number; count: number }>>(
      (acc, invoice) => {
        const name = invoice.client_name || invoice.client_email || "Sin cliente";
        if (!acc[name]) acc[name] = { name, total: 0, count: 0 };
        acc[name].total += Number(invoice.total || 0);
        acc[name].count += 1;
        return acc;
      },
      {}
    )
  )
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const recent = list.slice(0, 6);

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
          <p className="text-sm font-bold text-cyan-300">Tadeo Invoices</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight">Dashboard</h1>
              <p className="mt-2 text-slate-400">
                Métricas reales de facturas, pagos y clientes.
              </p>
            </div>

            <Link
              href={"/invoice/new" as any}
              className="rounded-2xl bg-cyan-400 px-6 py-3 text-center font-black text-slate-950 hover:bg-cyan-300"
            >
              + Nueva factura
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric title="Total facturado" value={money(totalRevenue)} />
          <Metric title="Pagado" value={money(paidRevenue)} tone="green" />
          <Metric title="Pendiente" value={money(pendingRevenue)} tone="yellow" />
          <Metric title="Promedio" value={money(averageInvoice)} />
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-3">
          <SmallMetric title="Facturas" value={String(totalCount)} />
          <SmallMetric title="Pagadas" value={String(paidCount)} />
          <SmallMetric title="Pendientes" value={String(pendingCount)} />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black">Facturas recientes</h2>
              <Link href={"/invoice" as any} className="text-sm font-bold text-cyan-300">
                Ver todas
              </Link>
            </div>

            <div className="space-y-3">
              {recent.length === 0 ? (
                <p className="rounded-2xl border border-white/10 p-5 text-slate-400">
                  Todavía no hay facturas.
                </p>
              ) : (
                recent.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-black">
                        {invoice.invoice_number || invoice.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-slate-400">
                        {invoice.client_name || "Sin cliente"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                          invoice.status === "paid"
                            ? "bg-emerald-400/10 text-emerald-300"
                            : "bg-amber-400/10 text-amber-300"
                        }`}
                      >
                        {invoice.status || "pending"}
                      </span>
                      <span className="font-black text-cyan-300">
                        {money(Number(invoice.total || 0), invoice.currency || "USD")}
                      </span>
                      <Link
                        href={`/invoice/${invoice.id}` as any}
                        className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold hover:bg-white/10"
                      >
                        Ver
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-black">Top clientes</h2>
            <div className="mt-5 space-y-3">
              {topClients.length === 0 ? (
                <p className="rounded-2xl border border-white/10 p-5 text-slate-400">
                  Sin clientes todavía.
                </p>
              ) : (
                topClients.map((client, index) => (
                  <div
                    key={client.name}
                    className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-black">
                        #{index + 1} {client.name}
                      </p>
                      <p className="font-black text-cyan-300">
                        {money(client.total)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                      {client.count} factura(s)
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({
  title,
  value,
  tone,
}: {
  title: string;
  value: string;
  tone?: "green" | "yellow";
}) {
  const color =
    tone === "green"
      ? "text-emerald-300"
      : tone === "yellow"
        ? "text-amber-300"
        : "text-cyan-300";

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm font-bold text-slate-400">{title}</p>
      <p className={`mt-3 text-3xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function SmallMetric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}