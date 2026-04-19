"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Lang = "es" | "en";

type InvoiceRow = {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  status: string;
  payment_status: string;
  currency: string;
  total: number;
  created_at: string | null;
  due_date: string | null;
  payment_url?: string;
};

type Props = {
  invoices: InvoiceRow[];
};

const copy = {
  es: {
    title: "Facturas",
    subtitle: "Panel profesional de facturación",
    search: "Buscar por cliente o número",
    all: "Todas",
    paid: "Pagadas",
    pending: "Pendientes",
    overdue: "Vencidas",
    draft: "Borradores",
    newInvoice: "Nueva factura",
    invoice: "Factura",
    client: "Cliente",
    status: "Estado",
    total: "Total",
    date: "Fecha",
    actions: "Acciones",
    view: "Ver",
    edit: "Editar",
    pdf: "PDF",
    pay: "Pagar",
    public: "Público",
    noResults: "No hay facturas para mostrar.",
    paidStatus: "Pagada",
    pendingStatus: "Pendiente",
    overdueStatus: "Vencida",
    draftStatus: "Borrador",
    loadingPay: "Abriendo pago...",
    payError: "No se pudo iniciar el pago.",
  },
  en: {
    title: "Invoices",
    subtitle: "Professional invoicing panel",
    search: "Search by client or number",
    all: "All",
    paid: "Paid",
    pending: "Pending",
    overdue: "Overdue",
    draft: "Draft",
    newInvoice: "New invoice",
    invoice: "Invoice",
    client: "Client",
    status: "Status",
    total: "Total",
    date: "Date",
    actions: "Actions",
    view: "View",
    edit: "Edit",
    pdf: "PDF",
    pay: "Pay",
    public: "Public",
    noResults: "There are no invoices to display.",
    paidStatus: "Paid",
    pendingStatus: "Pending",
    overdueStatus: "Overdue",
    draftStatus: "Draft",
    loadingPay: "Opening payment...",
    payError: "Could not start payment.",
  },
} as const;

export default function InvoiceListScreen({ invoices }: Props) {
  const [lang, setLang] = useState<Lang>("es");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "paid" | "pending" | "overdue" | "draft">("all");
  const [payingId, setPayingId] = useState<string>("");

  useEffect(() => {
    const syncLang = () => {
      const saved = localStorage.getItem("app_lang") as Lang | null;
      if (saved === "es" || saved === "en") setLang(saved);
      else setLang("es");
    };

    syncLang();
    window.addEventListener("storage", syncLang);
    window.addEventListener("app-language-changed", syncLang as EventListener);

    return () => {
      window.removeEventListener("storage", syncLang);
      window.removeEventListener("app-language-changed", syncLang as EventListener);
    };
  }, []);

  const t = useMemo(() => copy[lang], [lang]);

  const money = (value: number, currency = "USD") =>
    new Intl.NumberFormat(lang === "es" ? "es-US" : "en-US", {
      style: "currency",
      currency,
    }).format(value || 0);

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString(lang === "es" ? "es-US" : "en-US");
  };

  const visibleInvoices = invoices.filter((invoice) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      invoice.client_name.toLowerCase().includes(q) ||
      invoice.invoice_number.toLowerCase().includes(q) ||
      invoice.client_email.toLowerCase().includes(q);

    const normalizedStatus = String(invoice.status || "").toLowerCase();
    const matchesFilter = filter === "all" ? true : normalizedStatus === filter;

    return matchesSearch && matchesFilter;
  });

  const statusMeta = (status: string) => {
    const s = String(status || "").toLowerCase();

    if (s === "paid") {
      return {
        label: t.paidStatus,
        className: "border-green-400/20 bg-green-500/10 text-green-300",
      };
    }

    if (s === "overdue") {
      return {
        label: t.overdueStatus,
        className: "border-red-400/20 bg-red-500/10 text-red-300",
      };
    }

    if (s === "draft") {
      return {
        label: t.draftStatus,
        className: "border-amber-400/20 bg-amber-500/10 text-amber-300",
      };
    }

    return {
      label: t.pendingStatus,
      className: "border-yellow-400/20 bg-yellow-500/10 text-yellow-300",
    };
  };

  async function handlePay(invoiceId: string) {
    try {
      setPayingId(invoiceId);

      const res = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || t.payError);
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("LIST_PAY_ERROR", error);
      alert(t.payError);
      setPayingId("");
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">
                {t.subtitle}
              </p>
              <h1 className="mt-2 text-3xl font-semibold">{t.title}</h1>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.search}
                className="w-full min-w-[280px] rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
              />

              <Link
                href="/invoice/new"
                className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a,#111827,#1e293b)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.28)] transition hover:-translate-y-0.5"
              >
                {t.newInvoice}
              </Link>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {(["all", "paid", "pending", "overdue", "draft"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  filter === key
                    ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                    : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10"
                }`}
              >
                {t[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
          <div className="hidden grid-cols-12 border-b border-white/10 bg-white/5 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/45 md:grid">
            <div className="col-span-2">{t.invoice}</div>
            <div className="col-span-3">{t.client}</div>
            <div className="col-span-2">{t.status}</div>
            <div className="col-span-2">{t.total}</div>
            <div className="col-span-1">{t.date}</div>
            <div className="col-span-2 text-right">{t.actions}</div>
          </div>

          {visibleInvoices.length > 0 ? (
            visibleInvoices.map((invoice) => {
              const meta = statusMeta(invoice.status);

              return (
                <div
                  key={invoice.id}
                  className="border-b border-white/10 px-5 py-5 last:border-b-0"
                >
                  <div className="grid gap-4 md:grid-cols-12 md:items-center">
                    <div className="md:col-span-2">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/40 md:hidden">
                        {t.invoice}
                      </p>
                      <p className="font-semibold text-white">{invoice.invoice_number}</p>
                    </div>

                    <div className="md:col-span-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/40 md:hidden">
                        {t.client}
                      </p>
                      <p className="font-medium text-white">{invoice.client_name}</p>
                      <p className="text-sm text-white/50">
                        {invoice.client_email || "-"}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/40 md:hidden">
                        {t.status}
                      </p>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${meta.className}`}
                      >
                        {meta.label}
                      </span>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/40 md:hidden">
                        {t.total}
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {money(invoice.total, invoice.currency)}
                      </p>
                    </div>

                    <div className="md:col-span-1">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/40 md:hidden">
                        {t.date}
                      </p>
                      <p className="text-sm text-white/70">
                        {formatDate(invoice.created_at)}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex flex-wrap justify-start gap-2 md:justify-end">
                        <Link
                          href={`/invoice/${invoice.id}`}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
                        >
                          {t.view}
                        </Link>

                        <Link
                          href={`/invoice/${invoice.id}/edit`}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
                        >
                          {t.edit}
                        </Link>

                        <a
                          href={`/api/invoices/${invoice.id}/pdf`}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
                        >
                          {t.pdf}
                        </a>

                        <Link
                          href={`/invoice/${invoice.id}`}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
                        >
                          {t.public}
                        </Link>

                        {String(invoice.status).toLowerCase() !== "paid" ? (
                          <button
                            type="button"
                            onClick={() => handlePay(invoice.id)}
                            disabled={payingId === invoice.id}
                            className="rounded-xl bg-green-500/15 px-3 py-2 text-sm font-medium text-green-300 transition hover:bg-green-500/25 disabled:opacity-60"
                          >
                            {payingId === invoice.id ? t.loadingPay : t.pay}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-5 py-12 text-center text-white/55">{t.noResults}</div>
          )}
        </div>
      </div>
    </main>
  );
}