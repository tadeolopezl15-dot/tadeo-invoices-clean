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
  issue_date?: string | null;
};

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(value || 0));
}

function dateLabel(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getMonthKey(date?: string | null) {
  if (!date) return "Unknown";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, client_name, client_email, total, status, currency, created_at, issue_date"
    )
    .order("created_at", { ascending: false });

  const invoices = (data || []) as Invoice[];

  const totalRevenue = invoices.reduce((sum, i) => sum + Number(i.total || 0), 0);

  const paidRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.total || 0), 0);

  const pendingRevenue = invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + Number(i.total || 0), 0);

  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((i) => i.status === "paid").length;
  const pendingInvoices = invoices.filter((i) => i.status !== "paid").length;
  const averageInvoice = totalInvoices ? totalRevenue / totalInvoices : 0;
  const collectionRate =
    totalRevenue > 0 ? Math.round((paidRevenue / totalRevenue) * 100) : 0;

  const monthlyMap = invoices.reduce<Record<string, number>>((acc, invoice) => {
    const key = getMonthKey(invoice.issue_date || invoice.created_at);
    acc[key] = (acc[key] || 0) + Number(invoice.total || 0);
    return acc;
  }, {});

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const chartData = months.map((month) => ({
    month,
    value: monthlyMap[month] || 0,
  }));

  const maxChartValue = Math.max(...chartData.map((i) => i.value), 1);

  const recentInvoices = invoices.slice(0, 6);

  const topClients = Object.values(
    invoices.reduce<Record<string, { name: string; total: number; count: number }>>(
      (acc, invoice) => {
        const name = invoice.client_name || invoice.client_email || "Unknown Client";
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

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 shadow-2xl">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-blue-700/25 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
                Tadeo Invoices
              </p>
              <h1 className="mt-4 text-5xl font-black tracking-tight md:text-7xl">
                Revenue Command Center
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-slate-300">
                Stripe-style analytics for invoices, payments, clients, and
                outstanding balances.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={"/invoice" as any}
                className="rounded-2xl border border-white/10 px-5 py-3 text-center font-black text-white hover:bg-white/10"
              >
                View Invoices
              </Link>

              <Link
                href={"/invoice/new" as any}
                className="rounded-2xl bg-cyan-400 px-5 py-3 text-center font-black text-slate-950 shadow-lg shadow-cyan-400/20 hover:bg-cyan-300"
              >
                + New Invoice
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <Metric title="Total Revenue" value={money(totalRevenue)} />
          <Metric title="Paid Revenue" value={money(paidRevenue)} tone="green" />
          <Metric title="Outstanding" value={money(pendingRevenue)} tone="yellow" />
          <Metric title="Avg. Invoice" value={money(averageInvoice)} />
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-4">
          <Mini title="Invoices" value={String(totalInvoices)} />
          <Mini title="Paid" value={String(paidInvoices)} />
          <Mini title="Pending" value={String(pendingInvoices)} />
          <Mini title="Collection Rate" value={`${collectionRate}%`} />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">Revenue Trend</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Monthly invoice volume overview.
                </p>
              </div>
              <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-300">
                LIVE
              </span>
            </div>

            <div className="flex h-72 items-end gap-4 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
              {chartData.map((item) => {
                const height = Math.max((item.value / maxChartValue) * 100, 8);

                return (
                  <div key={item.month} className="flex flex-1 flex-col items-center gap-3">
                    <div className="flex h-52 w-full items-end">
                      <div
                        className="w-full rounded-t-2xl bg-gradient-to-t from-cyan-500 to-cyan-300 shadow-lg shadow-cyan-500/20"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <p className="text-xs font-bold text-slate-400">{item.month}</p>
                    <p className="text-xs font-black text-cyan-300">
                      {money(item.value)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
            <h2 className="text-2xl font-black">Top Clients</h2>
            <p className="mt-1 text-sm text-slate-400">
              Highest value customers by billed revenue.
            </p>

            <div className="mt-5 space-y-3">
              {topClients.length === 0 ? (
                <Empty title="No clients yet" text="Client rankings will appear here." />
              ) : (
                topClients.map((client, index) => (
                  <div
                    key={client.name}
                    className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-black">
                          #{index + 1} {client.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          {client.count} invoice(s)
                        </p>
                      </div>
                      <p className="font-black text-cyan-300">
                        {money(client.total)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">Recent Activity</h2>
              <p className="mt-1 text-sm text-slate-400">
                Latest invoices created in your workspace.
              </p>
            </div>

            <Link
              href={"/invoice" as any}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-cyan-300 hover:bg-white/10"
            >
              See all
            </Link>
          </div>

          <div className="space-y-3">
            {recentInvoices.length === 0 ? (
              <Empty title="No invoices yet" text="Create your first invoice to start tracking revenue." />
            ) : (
              recentInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-black">
                      {invoice.invoice_number || invoice.id.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {invoice.client_name || "Unknown Client"} ·{" "}
                      {dateLabel(invoice.issue_date || invoice.created_at)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                        invoice.status === "paid"
                          ? "bg-emerald-400/10 text-emerald-300"
                          : invoice.status === "sent"
                            ? "bg-blue-400/10 text-blue-300"
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
                      Open
                    </Link>
                  </div>
                </div>
              ))
            )}
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
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-xl">
      <p className="text-sm font-bold text-slate-400">{title}</p>
      <p className={`mt-3 text-3xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function Mini({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-center">
      <p className="font-black text-white">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{text}</p>
    </div>
  );
}