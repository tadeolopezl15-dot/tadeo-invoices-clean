import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Invoice = {
  id: string;
  invoice_number?: string | null;
  client_name?: string | null;
  client_email?: string | null;
  company_name?: string | null;
  total?: number | null;
  status?: string | null;
  currency?: string | null;
  issue_date?: string | null;
  due_date?: string | null;
  public_token?: string | null;
};

const baseBtn =
  "rounded-xl border border-white/10 px-3 py-2 text-xs font-black transition hover:bg-white/10";

const blueBtn =
  "rounded-xl border border-blue-400/30 bg-blue-400/10 px-3 py-2 text-xs font-black text-blue-200 transition hover:bg-blue-400/20";

const purpleBtn =
  "rounded-xl border border-purple-400/30 bg-purple-400/10 px-3 py-2 text-xs font-black text-purple-200 transition hover:bg-purple-400/20";

const cyanBtn =
  "rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-black text-cyan-200 transition hover:bg-cyan-400/20";

const greenBtn =
  "rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-200 transition hover:bg-emerald-400/20";

const payBtn =
  "rounded-xl border border-cyan-400 bg-cyan-400 px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-cyan-300";

const redBtn =
  "rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs font-black text-red-200 transition hover:bg-red-400/20";

function money(value?: number | null, currency = "USD") {
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

async function deleteInvoice(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = await createClient();

  await supabase.from("invoice_items").delete().eq("invoice_id", id);
  await supabase.from("invoices").delete().eq("id", id);

  revalidatePath("/invoice");
}

export default async function InvoicePage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, client_name, client_email, company_name, total, status, currency, issue_date, due_date, public_token"
    )
    .order("issue_date", { ascending: false });

  const invoices = (data || []) as Invoice[];

  const totalRevenue = invoices.reduce((sum, i) => sum + Number(i.total || 0), 0);

  const paidRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.total || 0), 0);

  const pendingRevenue = invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + Number(i.total || 0), 0);

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
                Tadeo Invoices
              </p>
              <h1 className="mt-3 text-5xl font-black tracking-tight">
                Invoices
              </h1>
              <p className="mt-3 max-w-2xl text-slate-400">
                Manage invoices, send professional emails, download PDFs, collect
                Stripe payments, and track client billing.
              </p>
            </div>

            <Link
              href={"/invoice/new" as any}
              className="rounded-2xl bg-cyan-400 px-6 py-4 text-center font-black text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-300"
            >
              + New Invoice
            </Link>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <Metric title="Total Billed" value={money(totalRevenue)} />
          <Metric title="Paid" value={money(paidRevenue)} tone="green" />
          <Metric title="Outstanding" value={money(pendingRevenue)} tone="yellow" />
        </section>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left">
              <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-4">Invoice</th>
                  <th className="px-5 py-4">Client</th>
                  <th className="px-5 py-4">Issue Date</th>
                  <th className="px-5 py-4">Due Date</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Total</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <p className="text-xl font-black">No invoices yet</p>
                      <p className="mt-2 text-slate-400">
                        Create your first professional invoice.
                      </p>
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => {
                    const pdfUrl = `/api/invoices/${invoice.id}/pdf`;
                    const payUrl = `/api/invoices/${invoice.id}/pay`;
                    const publicUrl = invoice.public_token
                      ? `/public-invoice/${invoice.public_token}`
                      : `/invoice/${invoice.id}`;

                    return (
                      <tr key={invoice.id} className="hover:bg-white/[0.03]">
                        <td className="px-5 py-5">
                          <p className="font-black">
                            {invoice.invoice_number || invoice.id.slice(0, 8)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            ID: {invoice.id.slice(0, 8)}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-bold">
                            {invoice.client_name || "Unknown Client"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {invoice.client_email || "No email"}
                          </p>
                        </td>

                        <td className="px-5 py-5 text-sm text-slate-300">
                          {dateLabel(invoice.issue_date)}
                        </td>

                        <td className="px-5 py-5 text-sm text-slate-300">
                          {dateLabel(invoice.due_date)}
                        </td>

                        <td className="px-5 py-5">
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
                        </td>

                        <td className="px-5 py-5 text-right font-black text-cyan-300">
                          {money(invoice.total, invoice.currency || "USD")}
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Link href={`/invoice/${invoice.id}` as any} className={baseBtn}>
                              View
                            </Link>

                            <Link href={`/invoice/${invoice.id}/edit` as any} className={blueBtn}>
                              Edit
                            </Link>

                            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className={purpleBtn}>
                              PDF
                            </a>

                            <a href={pdfUrl} download className={cyanBtn}>
                              Download
                            </a>

                            <Link href={`/invoice/${invoice.id}/email` as any} className={greenBtn}>
                              Email
                            </Link>

                            <a href={payUrl} className={payBtn}>
                              Pay
                            </a>

                            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className={baseBtn}>
                              Public
                            </a>

                            <form action={deleteInvoice}>
                              <input type="hidden" name="id" value={invoice.id} />
                              <button className={redBtn} type="submit">
                                Delete
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
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