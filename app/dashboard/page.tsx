"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Lang = "es" | "en";

const translations = {
  es: {
    badge: "Panel principal",
    title: "Administra tu negocio desde un solo lugar",
    subtitle:
      "Controla facturas, clientes, reportes y configuración con una experiencia moderna, limpia y profesional.",
    createInvoice: "Crear factura",
    viewClients: "Ver clientes",
    viewPricing: "Ver membresías",
    settings: "Configuración",
    totalInvoices: "Facturas totales",
    totalClients: "Clientes",
    totalRevenue: "Ingresos",
    pending: "Pendientes",
    quickAccess: "Accesos rápidos",
    quickAccessText:
      "Navega rápido entre las secciones más importantes de tu app.",
    invoices: "Facturas",
    reports: "Reportes",
    memberships: "Membresías",
    publicInvoice: "Factura pública",
    welcomeTitle: "Bienvenido a Tadeo Invoices",
    welcomeText:
      "Tu plataforma de facturación premium para trabajar mejor en móvil y en PC.",
  },
  en: {
    badge: "Main dashboard",
    title: "Manage your business from one place",
    subtitle:
      "Control invoices, clients, reports, and settings with a modern, clean, and professional experience.",
    createInvoice: "Create invoice",
    viewClients: "View clients",
    viewPricing: "View memberships",
    settings: "Settings",
    totalInvoices: "Total invoices",
    totalClients: "Clients",
    totalRevenue: "Revenue",
    pending: "Pending",
    quickAccess: "Quick access",
    quickAccessText:
      "Move quickly between the most important sections of your app.",
    invoices: "Invoices",
    reports: "Reports",
    memberships: "Memberships",
    publicInvoice: "Public invoice",
    welcomeTitle: "Welcome to Tadeo Invoices",
    welcomeText:
      "Your premium invoicing platform built to work well on mobile and desktop.",
  },
} as const;

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}

export default function DashboardPage() {
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
    invoices: 0,
    clients: 0,
    revenue: 0,
    pending: 0,
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_45%,_#ffffff_100%)] px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
            {t.badge}
          </p>

          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                {t.title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                {t.subtitle}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/invoice/new"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                {t.createInvoice}
              </Link>
              <Link
                href="/clientes"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
              >
                {t.viewClients}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{t.totalInvoices}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.invoices}
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{t.totalClients}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.clients}
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{t.totalRevenue}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {money(stats.revenue)}
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{t.pending}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {stats.pending}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-950">
              {t.quickAccess}
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600 md:text-base">
              {t.quickAccessText}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Link
                href="/invoice"
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:bg-white hover:shadow-sm"
              >
                <p className="text-lg font-semibold text-slate-950">
                  {t.invoices}
                </p>
              </Link>

              <Link
                href="/reportes"
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:bg-white hover:shadow-sm"
              >
                <p className="text-lg font-semibold text-slate-950">
                  {t.reports}
                </p>
              </Link>

              <Link
                href="/pricing"
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:bg-white hover:shadow-sm"
              >
                <p className="text-lg font-semibold text-slate-950">
                  {t.memberships}
                </p>
              </Link>

              <Link
                href="/configuracion"
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:bg-white hover:shadow-sm"
              >
                <p className="text-lg font-semibold text-slate-950">
                  {t.settings}
                </p>
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
            <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              {t.publicInvoice}
            </p>

            <h3 className="mt-4 text-2xl font-bold text-slate-950">
              {t.welcomeTitle}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
              {t.welcomeText}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/invoice/new"
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {t.createInvoice}
              </Link>

              <Link
                href="/clientes"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {t.viewClients}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}