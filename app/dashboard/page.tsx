"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}

export default function DashboardPage() {
  const { lang, t } = useLang();

  const stats = {
    invoices: 0,
    clients: 0,
    revenue: 0,
    pending: 0,
  };

  const ui =
    lang === "es"
      ? {
          badge: "Panel principal",
          title: "Administra tu negocio desde un solo lugar",
          subtitle:
            "Controla facturas, clientes, ingresos y pagos con una experiencia moderna, limpia y profesional.",
          quickAccess: "Accesos rápidos",
          quickAccessText:
            "Navega rápido entre las secciones más importantes de tu app.",
          recentInvoices: "Facturas recientes",
          recentInvoicesText: "Últimas facturas registradas en tu cuenta.",
          totalInvoices: "Facturas totales",
          totalClients: "Clientes",
          totalRevenue: "Ingresos",
          pending: "Pendientes",
          createFirstInvoice: "Crear primera factura",
          noInvoices: "Aún no tienes facturas registradas.",
          viewAll: "Ver todas",
          publicInvoice: "Factura pública",
          welcomeTitle: "Bienvenido a Tadeo Invoices",
          welcomeText:
            "Tu plataforma de facturación premium para trabajar mejor en móvil y en PC.",
        }
      : {
          badge: "Main dashboard",
          title: "Manage your business from one place",
          subtitle:
            "Control invoices, clients, revenue, and payments with a modern, clean, and professional experience.",
          quickAccess: "Quick access",
          quickAccessText:
            "Move quickly between the most important sections of your app.",
          recentInvoices: "Recent invoices",
          recentInvoicesText: "Latest invoices registered in your account.",
          totalInvoices: "Total invoices",
          totalClients: "Clients",
          totalRevenue: "Revenue",
          pending: "Pending",
          createFirstInvoice: "Create first invoice",
          noInvoices: "You do not have invoices yet.",
          viewAll: "View all",
          publicInvoice: "Public invoice",
          welcomeTitle: "Welcome to Tadeo Invoices",
          welcomeText:
            "Your premium invoicing platform built to work well on mobile and desktop.",
        };

  const recentInvoices: Array<{
    id: string;
    client_name: string;
    total: number;
    status: "paid" | "pending";
  }> = [];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_45%,_#ffffff_100%)] px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
            {ui.badge}
          </p>

          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                {ui.title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                {ui.subtitle}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/invoice/new"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                {t.common.createInvoice}
              </Link>
              <Link
                href="/clientes"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
              >
                {t.common.clients}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{ui.totalInvoices}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.invoices}
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{ui.totalClients}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.clients}
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{ui.totalRevenue}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {money(stats.revenue)}
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{ui.pending}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.pending}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-950">
              {ui.quickAccess}
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600 md:text-base">
              {ui.quickAccessText}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Link
                href="/invoice"
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:bg-white hover:shadow-sm"
              >
                <p className="text-lg font-semibold text-slate-950">
                  {t.common.invoices}
                </p>
              </Link>

              <Link
                href="/reportes"
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:bg-white hover:shadow-sm"
              >
                <p className="text-lg font-semibold text-slate-950">
                  {t.common.reports}
                </p>
              </Link>

              <Link
                href="/pricing"
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:bg-white hover:shadow-sm"
              >
                <p className="text-lg font-semibold text-slate-950">
                  {t.common.memberships}
                </p>
              </Link>

              <Link
                href="/configuracion"
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:bg-white hover:shadow-sm"
              >
                <p className="text-lg font-semibold text-slate-950">
                  {t.common.settings}
                </p>
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  {ui.recentInvoices}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {ui.recentInvoicesText}
                </p>
              </div>

              <Link
                href="/invoice"
                className="text-sm font-semibold text-blue-700 transition hover:text-blue-800"
              >
                {ui.viewAll}
              </Link>
            </div>

            {recentInvoices.length === 0 ? (
              <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-6 text-center">
                <p className="text-sm text-slate-600">{ui.noInvoices}</p>
                <Link
                  href="/invoice/new"
                  className="mt-4 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  {ui.createFirstInvoice}
                </Link>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {recentInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-950">
                          {invoice.client_name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {t.common.amount}: {money(invoice.total)}
                        </p>
                      </div>

                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          invoice.status === "paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {invoice.status === "paid"
                          ? t.common.paid
                          : t.common.pending}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            {ui.publicInvoice}
          </p>

          <h3 className="mt-4 text-2xl font-bold text-slate-950">
            {ui.welcomeTitle}
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
            {ui.welcomeText}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/invoice/new"
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {t.common.createInvoice}
            </Link>

            <Link
              href="/clientes"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {t.common.clients}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}