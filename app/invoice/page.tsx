import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

type Invoice = {
  id: string;
  invoice_number: string | null;
  company_name: string | null;
  company_email: string | null;
  total: number | null;
  status: string | null;
  currency: string | null;
  issue_date: string | null;
  created_at: string | null;
  public_token: string | null;
};

function money(value: number | null | undefined, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(value || 0));
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function statusStyle(status?: string | null) {
  const value = String(status || "pending").toLowerCase();

  if (value === "paid") {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
  }

  if (value === "canceled" || value === "cancelled") {
    return "border-red-400/20 bg-red-500/10 text-red-300";
  }

  return "border-amber-400/20 bg-amber-500/10 text-amber-300";
}

function statusLabel(status?: string | null) {
  const value = String(status || "pending").toLowerCase();

  if (value === "paid") return "Paid";
  if (value === "canceled" || value === "cancelled") return "Canceled";

  return "Pending";
}

export default async function InvoicePage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050816] px-6 py-10 text-white">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/30">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-300">
              Tadeo Invoices
            </p>
            <h1 className="mt-4 text-4xl font-black">Sign in required</h1>
            <p className="mt-3 text-slate-400">
              You need to sign in before viewing your invoices.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex rounded-2xl bg-blue-500 px-6 py-3 font-black text-white shadow-xl shadow-blue-500/25 transition hover:bg-blue-400"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, company_name, company_email, total, status, currency, issue_date, created_at, public_token"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const invoices = (data || []) as Invoice[];

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

  const pendingAmount = pendingInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.total || 0),
    0
  );

  return (
    <main className="min-h-screen bg-[#050816] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-blue-200 transition hover:bg-white/10"
            >
              ← Back to dashboard
            </Link>

            <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
              Invoices
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
              Manage every invoice, payment status, public link, and client
              balance from one ultra-clean workspace.
            </p>
          </div>

          <Link
            href="/invoice/new"
            className="rounded-2xl bg-blue-500 px-6 py-4 text-center font-black text-white shadow-xl shadow-blue-500/25 transition hover:bg-blue-400"
          >
            + Create Invoice
          </Link>
        </div>

        {error ? (
          <div className="mt-6 rounded-3xl border border-red-400/30 bg-red-500/10 p-5 text-sm font-semibold text-red-200">
            Could not load invoices: {error.message}
          </div>
        ) : null}

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <MetricCard
            label="Total Revenue"
            value={money(totalRevenue)}
            note="Paid invoices only"
          />
          <MetricCard
            label="Pending Balance"
            value={money(pendingAmount)}
            note="Awaiting payment"
          />
          <MetricCard
            label="Total Invoices"
            value={invoices.length}
            note={`${paidInvoices.length} paid · ${pendingInvoices.length} pending`}
          />
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black">Invoice Center</h2>
              <p className="mt-1 text-sm text-slate-500">
                Click any invoice to open details, PDF, payment link, or edit.
              </p>
            </div>

            <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-bold text-slate-300">
              {invoices.length} records
            </div>
          </div>

          {invoices.length ? (
            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/10">
              <div className="hidden grid-cols-12 bg-white/[0.03] px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 lg:grid">
                <div className="col-span-3">Invoice</div>
                <div className="col-span-3">Client</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <div className="divide-y divide-white/10">
                {invoices.map((invoice) => (
                  <Link
                    key={invoice.id}
                    href={`/invoice/${invoice.id}`}
                    className="grid gap-4 px-5 py-5 transition hover:bg-white/[0.04] lg:grid-cols-12 lg:items-center"
                  >
                    <div className="lg:col-span-3">
                      <p className="font-black text-white">
                        {invoice.invoice_number ||
                          `INV-${invoice.id.slice(0, 8)}`}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        ID: {invoice.id.slice(0, 8)}
                      </p>
                    </div>

                    <div className="lg:col-span-3">
                      <p className="text-sm font-bold text-slate-200">
                        {invoice.company_name || "Unnamed client"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {invoice.company_email || "No email"}
                      </p>
                    </div>

                    <div className="text-sm font-semibold text-slate-400 lg:col-span-2">
                      {formatDate(invoice.issue_date || invoice.created_at)}
                    </div>

                    <div className="lg:col-span-2">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusStyle(
                          invoice.status
                        )}`}
                      >
                        {statusLabel(invoice.status)}
                      </span>
                    </div>

                    <div className="text-xl font-black text-white lg:col-span-2 lg:text-right">
                      {money(invoice.total, invoice.currency || "USD")}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[2rem] border border-dashed border-white/10 bg-black/20 p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-3xl">
                📄
              </div>
              <h3 className="mt-5 text-2xl font-black">No invoices yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Create your first professional invoice and start tracking your
                client payments.
              </p>
              <Link
                href="/invoice/new"
                className="mt-6 inline-flex rounded-2xl bg-blue-500 px-6 py-3 font-black text-white shadow-xl shadow-blue-500/25 transition hover:bg-blue-400"
              >
                Create Invoice
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20">
      <p className="text-sm font-bold text-slate-400">{label}</p>
      <h2 className="mt-3 text-3xl font-black text-white">{value}</h2>
      <p className="mt-2 text-sm text-slate-500">{note}</p>
    </div>
  );
}