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
  return new Date(date).toLocaleDateString("en-US");
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });

  const invoices = (data || []) as Invoice[];

  const totalRevenue = invoices.reduce((sum, i) => sum + Number(i.total || 0), 0);
  const paidRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.total || 0), 0);
  const pendingRevenue = invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + Number(i.total || 0), 0);

  const recent = invoices.slice(0, 5);

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        {/* HERO */}
        <div className="mb-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <p className="text-cyan-300 font-bold">Tadeo Invoices</p>
          <h1 className="text-5xl font-black mt-2">Business Dashboard</h1>
          <p className="text-slate-400 mt-2">
            Monitor revenue, invoices, and performance in real time.
          </p>

          <Link
            href="/invoice/new"
            className="mt-6 inline-block rounded-2xl bg-cyan-400 px-6 py-3 font-black text-black"
          >
            + New Invoice
          </Link>
        </div>

        {/* METRICS */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card title="Total Revenue" value={money(totalRevenue)} />
          <Card title="Paid" value={money(paidRevenue)} color="green" />
          <Card title="Pending" value={money(pendingRevenue)} color="yellow" />
        </div>

        {/* RECENT */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-black mb-4">Recent Invoices</h2>

          {recent.length === 0 ? (
            <p className="text-slate-400">No invoices yet</p>
          ) : (
            recent.map((inv) => (
              <div
                key={inv.id}
                className="flex justify-between items-center border-b border-white/10 py-4"
              >
                <div>
                  <p className="font-bold">
                    {inv.invoice_number || inv.id}
                  </p>
                  <p className="text-sm text-slate-400">
                    {inv.client_name || "No client"} · {dateLabel(inv.issue_date)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      inv.status === "paid"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {inv.status || "pending"}
                  </span>

                  <span className="text-cyan-300 font-black">
                    {money(Number(inv.total || 0))}
                  </span>

                  <Link
                    href={`/invoice/${inv.id}`}
                    className="text-xs border px-3 py-2 rounded-xl"
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  );
}

/* COMPONENT */

function Card({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color?: "green" | "yellow";
}) {
  const text =
    color === "green"
      ? "text-green-400"
      : color === "yellow"
        ? "text-yellow-400"
        : "text-cyan-300";

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <p className="text-slate-400">{title}</p>
      <h2 className={`text-3xl font-black mt-2 ${text}`}>{value}</h2>
    </div>
  );
}