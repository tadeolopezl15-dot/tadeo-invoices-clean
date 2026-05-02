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

  const collectionRate =
    totalRevenue > 0 ? Math.round((paidRevenue / totalRevenue) * 100) : 0;

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
                Tadeo Invoices
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
                Business Dashboard
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-slate-300">
                Track revenue, paid invoices, pending balances, client activity,
                and business performance in one premium workspace.
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
          <MetricCard title="Total Revenue" value={money(totalRevenue)} />
          <MetricCard title="Paid Revenue" value={money(paidRevenue)} tone="green" />
          <MetricCard title="Outstanding" value={money(pendingRevenue)} tone="yellow" />
          <MetricCard title="Average Invoice" value={money(averageInvoice)} />
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-4">
          <MiniCard title="Total Invoices" value={String(totalInvoices)} />
          <MiniCard title="Paid" value={String(paidInvoices)} />
          <MiniCard title="Pending" value={String(pendingInvoices)} />
          <MiniCard title="Collection Rate" value={`${collectionRate}%`} />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">Recent Invoices</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Latest billing activity from your account.
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
                <EmptyState
                  title="No invoices yet"
                  text="Create your first invoice to start tracking revenue."
                />
              ) : (
                recentInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-black text-white">
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
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
              <h2 className="text-2xl font-black">Top Clients</h2>
              <p className="mt-1 text-sm text-slate-400">
                Clients ranked by total billed amount.
              </p>

              <div className="mt-5 space-y-3">
                {topClients.length === 0 ? (
                  <EmptyState title="No clients yet" text="Client rankings appear here." />
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
            </div>

            <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 p-6 shadow-2xl">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
                Quick Action
              </p>
              <h3 className="mt-3 text-2xl font-black">Send a new invoice</h3>
              <p className="mt-2 text-sm text-slate-300">
                Create, email, download PDF, and collect payment with Stripe.
              </p>

              <Link
                href={"/invoice/new" as any}
                className="mt-5 block rounded-2xl bg-cyan-400 px-5 py-3 text-center font-black text-slate-950 hover:bg-cyan-300"
              >
                Create Invoice
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function MetricCard({
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

function MiniCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5 text-center">
      <p className="font-black text-white">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{text}</p>
    </div>
  );
}