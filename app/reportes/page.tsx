"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Lang = "es" | "en";

const translations = {
  es: {
    badge: "Reportes",
    title: "Visualiza el rendimiento de tu negocio",
    subtitle:
      "Obtén una vista rápida de facturación, estado de cobros y actividad de clientes.",
    totalRevenue: "Ingresos totales",
    totalInvoices: "Facturas",
    paidInvoices: "Facturas pagadas",
    pendingInvoices: "Facturas pendientes",
    monthlyOverview: "Resumen mensual",
    monthlyText:
      "Aquí puedes mostrar más adelante una gráfica real de ingresos por mes.",
    topClients: "Clientes destacados",
    topClientsText:
      "Agrega aquí el ranking de tus mejores clientes según monto facturado.",
    backDashboard: "Volver al dashboard",
    export: "Exportar reporte",
  },
  en: {
    badge: "Reports",
    title: "Visualize your business performance",
    subtitle:
      "Get a quick view of revenue, payment status, and client activity.",
    totalRevenue: "Total revenue",
    totalInvoices: "Invoices",
    paidInvoices: "Paid invoices",
    pendingInvoices: "Pending invoices",
    monthlyOverview: "Monthly overview",
    monthlyText:
      "Here you can later display a real monthly income chart.",
    topClients: "Top clients",
    topClientsText:
      "Add here the ranking of your best clients by billed amount.",
    backDashboard: "Back to dashboard",
    export: "Export report",
  },
} as const;

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}

export default function ReportesPage() {
  const [lang, setLang] = useState<Lang>("es");

  useEffect(() => {
    const saved = localStorage.getItem("app_lang");
    if (saved === "es" || saved === "en") {
      setLang(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const t = useMemo(() => translations[lang], [lang]);

  const stats = {
    totalRevenue: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_45%,_#ffffff_100%)] px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                {t.badge}
              </p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                {t.title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                {t.subtitle}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                {t.export}
              </button>

              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
              >
                {t.backDashboard}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{t.totalRevenue}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {money(stats.totalRevenue)}
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{t.totalInvoices}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.totalInvoices}
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{t.paidInvoices}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.paidInvoices}
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{t.pendingInvoices}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.pendingInvoices}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-950">
              {t.monthlyOverview}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {t.monthlyText}
            </p>

            <div className="mt-6 h-64 rounded-[24px] border border-dashed border-slate-300 bg-slate-50" />
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-950">
              {t.topClients}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {t.topClientsText}
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Cliente 1</p>
                <p className="mt-1 text-sm text-slate-500">$0.00</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Cliente 2</p>
                <p className="mt-1 text-sm text-slate-500">$0.00</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Cliente 3</p>
                <p className="mt-1 text-sm text-slate-500">$0.00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}