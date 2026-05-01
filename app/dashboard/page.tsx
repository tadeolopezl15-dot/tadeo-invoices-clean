import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";

type Invoice = {
  id: string;
  invoice_number: string | null;
  company_name: string | null;
  client_name?: string | null;
  customer_name?: string | null;
  total: number | null;
  status: string | null;
  issue_date: string | null;
  created_at: string | null;
  currency: string | null;
};

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value || 0);
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getClientName(invoice: Invoice) {
  return (
    invoice.client_name ||
    invoice.customer_name ||
    invoice.company_name ||
    "Unnamed client"
  );
}

export default async function DashboardPage() {
  const supabase = await createServerClient();

  const { data: invoicesData } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, company_name, client_name, customer_name, total, status, issue_date, created_at, currency"
    )
    .order("created_at", { ascending: false });

  const invoices = (invoicesData || []) as Invoice[];

  const paidInvoices = invoices.filter(
    (invoice) => String(invoice.status || "").toLowerCase() === "paid"
  );

  const pendingInvoices = invoices.filter(
    (invoice) => String(invoice.status || "").toLowerCase() !== "paid"
  );

  const totalRevenue = paidInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.total || 0),
    0
  );

  const totalPending = pendingInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.total || 0),
    0
  );

  const totalInvoices = invoices.length;
  const paidCount = paidInvoices.length;
  const pendingCount = pendingInvoices.length;

  const averageInvoice =
    paidCount > 0 ? totalRevenue / paidCount : 0;

  const recentInvoices = invoices.slice(0, 6);

  const topClients = Object.values(
    paidInvoices.reduce<Record<string, { name: string; total: number; count: number }>>(
      (acc, invoice) => {
        const name = getClientName(invoice);
        if (!acc[name]) {
          acc[name] = { name, total: 0, count: 0 };
        }

        acc[name].total += Number(invoice.total || 0);
        acc[name].count += 1;

        return acc;
      },
      {}
    )
  )
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const maxClientTotal = Math.max(...topClients.map((client) => client.total), 1);

  return (
    <main className="min-h-screen bg-[#050816] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Top bar */}
        <div className="flex flex-col gap-5 border-b border-white/10 pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-blue-200">
              Tadeo Invoices
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
              Business Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
              Track revenue, invoices, payment status, and client performance from one premium dashboard.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/invoice"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-white/10"
            >
              View Invoices
            </Link>

            <Link
              href="/invoice/new"
              className="rounded-2xl bg-blue-500 px-5 py-3 text-center text-sm font-bold text-white shadow-xl shadow-blue-500/25 transition hover:bg-blue-400"
            >
              + Create Invoice
            </Link>
          </div>
        </div>

        {/* Hero revenue */}
        <section className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-950 p-8 shadow-2xl shadow-blue-950/40 lg:col-span-7">
            <div className="absolute right-[-80px] top-[-80px] h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-[-100px] left-[-100px] h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

            <div className="relative">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-100">
                Total Revenue
              </p>

              <h2 className="mt-4 text-5xl font-black tracking-tight md:text-6xl">
                {money(totalRevenue)}
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100">
                Revenue calculated from paid invoices only. Pending invoices are tracked separately.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <MiniStat label="Paid invoices" value={paidCount} />
                <MiniStat label="Pending invoices" value={pendingCount} />
                <MiniStat label="Average invoice" value={money(averageInvoice)} />
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20 lg:col-span-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-300">
                  Payment Overview
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Real-time invoice status
                </p>
              </div>

              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                Live
              </span>
            </div>

            <div className="mt-8 space-y-5">
              <ProgressRow
                label="Paid"
                value={paidCount}
                total={Math.max(totalInvoices, 1)}
                amount={money(totalRevenue)}
              />
              <ProgressRow
                label="Pending"
                value={pendingCount}
                total={Math.max(totalInvoices, 1)}
                amount={money(totalPending)}
              />
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Collection Status
              </p>
              <h3 className="mt-3 text-2xl font-black">
                {pendingCount === 0 ? "All caught up" : `${pendingCount} pending`}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {pendingCount === 0
                  ? "No unpaid invoices require action right now."
                  : "Follow up with clients to improve cash flow."}
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Invoices" value={totalInvoices} note="All invoices created" />
          <StatCard title="Paid Revenue" value={money(totalRevenue)} note="Confirmed paid income" />
          <StatCard title="Pending Amount" value={money(totalPending)} note="Awaiting payment" />
          <StatCard title="Avg. Invoice" value={money(averageInvoice)} note="Paid invoice average" />
        </section>

        {/* Tables */}
        <section className="mt-6 grid gap-6 lg:grid-cols-12">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20 lg:col-span-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">Recent Invoices</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Latest customer invoices
                </p>
              </div>

              <Link
                href="/invoice"
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10"
              >
                See all
              </Link>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              {recentInvoices.length ? (
                <div className="divide-y divide-white/10">
                  {recentInvoices.map((invoice) => {
                    const status = String(invoice.status || "pending").toLowerCase();
                    const isPaid = status === "paid";

                    return (
                      <Link
                        key={invoice.id}
                        href={`/invoice/${invoice.id}`}
                        className="grid gap-4 px-4 py-4 transition hover:bg-white/[0.04] md:grid-cols-12 md:items-center"
                      >
                        <div className="md:col-span-3">
                          <p className="font-bold text-white">
                            {invoice.invoice_number || `INV-${invoice.id.slice(0, 8)}`}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatDate(invoice.issue_date || invoice.created_at)}
                          </p>
                        </div>

                        <div className="md:col-span-4">
                          <p className="text-sm font-semibold text-slate-300">
                            {getClientName(invoice)}
                          </p>
                        </div>

                        <div className="md:col-span-2">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                              isPaid
                                ? "bg-emerald-500/10 text-emerald-300"
                                : "bg-amber-500/10 text-amber-300"
                            }`}
                          >
                            {isPaid ? "Paid" : "Pending"}
                          </span>
                        </div>

                        <div className="font-black text-white md:col-span-3 md:text-right">
                          {money(Number(invoice.total || 0), invoice.currency || "USD")}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <h3 className="text-lg font-black">No invoices yet</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Create your first invoice to start tracking revenue.
                  </p>
                  <Link
                    href="/invoice/new"
                    className="mt-5 inline-flex rounded-2xl bg-blue-500 px-5 py-3 text-sm font-bold text-white"
                  >
                    Create Invoice
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20 lg:col-span-4">
            <h2 className="text-xl font-black">Top Clients</h2>
            <p className="mt-1 text-sm text-slate-500">
              Ranked by paid revenue
            </p>

            <div className="mt-6 space-y-5">
              {topClients.length ? (
                topClients.map((client) => (
                  <div key={client.name}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-white">{client.name}</p>
                        <p className="text-xs text-slate-500">
                          {client.count} paid invoice{client.count === 1 ? "" : "s"}
                        </p>
                      </div>

                      <p className="text-sm font-black">
                        {money(client.total)}
                      </p>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{
                          width: `${Math.max(
                            8,
                            Math.round((client.total / maxClientTotal) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center">
                  <p className="text-sm text-slate-500">
                    Top clients will appear after invoices are paid.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="mt-6 grid gap-5 md:grid-cols-3">
          <ActionCard
            title="Create Invoice"
            desc="Build a new professional invoice."
            href="/invoice/new"
          />
          <ActionCard
            title="Company Settings"
            desc="Update logo, company details, and invoice branding."
            href="/configuracion"
          />
          <ActionCard
            title="Reports"
            desc="Review business reports and performance."
            href="/reportes"
          />
        </section>
      </div>
    </main>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-100">
        {label}
      </p>
      <p className="mt-2 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  total,
  amount,
}: {
  label: string;
  value: number;
  total: number;
  amount: string;
}) {
  const percent = Math.round((value / total) * 100);

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <p className="font-bold text-slate-200">{label}</p>
        <p className="font-black text-white">{amount}</p>
      </div>

      <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-blue-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {value} invoice{value === 1 ? "" : "s"} · {percent}%
      </p>
    </div>
  );
}

function StatCard({
  title,
  value,
  note,
}: {
  title: string;
  value: string | number;
  note: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20">
      <p className="text-sm font-bold text-slate-400">{title}</p>
      <h3 className="mt-3 text-3xl font-black text-white">{value}</h3>
      <p className="mt-2 text-sm text-slate-500">{note}</p>
    </div>
  );
}

function ActionCard({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:bg-white/[0.07]"
    >
      <h3 className="text-lg font-black text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
    </Link>
  );
}