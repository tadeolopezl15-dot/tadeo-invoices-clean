"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Lang = "es" | "en";

const translations = {
  es: {
    dashboard: "Dashboard",
    invoices: "Facturas",
    clients: "Clientes",
    reports: "Reportes",
    settings: "Configuración",
    pricing: "Planes",
    login: "Login",
    signup: "Empezar",
    create: "Crear factura",
    menu: "Menú",
    close: "Cerrar",
  },
  en: {
    dashboard: "Dashboard",
    invoices: "Invoices",
    clients: "Clients",
    reports: "Reports",
    settings: "Settings",
    pricing: "Pricing",
    login: "Login",
    signup: "Get started",
    create: "New invoice",
    menu: "Menu",
    close: "Close",
  },
} as const;

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("es");

  useEffect(() => {
    const saved = localStorage.getItem("app_lang");
    if (saved === "es" || saved === "en") {
      setLang(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  function toggleLang() {
    const next: Lang = lang === "es" ? "en" : "es";
    setLang(next);
    localStorage.setItem("app_lang", next);
    document.documentElement.lang = next;
  }

  const t = translations[lang];

  const nav = [
    { href: "/dashboard", label: t.dashboard },
    { href: "/invoice", label: t.invoices },
    { href: "/clientes", label: t.clients },
    { href: "/reportes", label: t.reports },
    { href: "/configuracion", label: t.settings },
    { href: "/pricing", label: t.pricing },
  ];

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-blue-900 to-blue-600 text-sm font-black text-white shadow-xl shadow-blue-900/20">
            <span className="relative z-10">TI</span>
            <span className="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-100" />
          </div>

          <div className="leading-tight">
            <p className="text-sm font-black tracking-tight text-slate-950 md:text-base">
              Tadeo Invoices
            </p>
            <p className="hidden text-xs font-semibold text-slate-500 sm:block">
              SaaS Billing Platform
            </p>
          </div>
        </Link>

        <nav className="hidden items-center rounded-2xl border border-slate-200 bg-slate-50/80 p-1 shadow-sm lg:flex">
          {nav.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2 text-sm font-extrabold transition ${
                  active
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:bg-white hover:text-slate-950"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={toggleLang}
            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            {lang === "es" ? "EN" : "ES"}
          </button>

          <Link
            href="/login"
            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            {t.login}
          </Link>

          <Link
            href="/invoice/new"
            className="h-11 rounded-2xl bg-gradient-to-r from-blue-600 to-slate-950 px-5 py-3 text-sm font-black text-white shadow-xl shadow-blue-600/20 transition hover:scale-[1.02] hover:shadow-blue-600/30"
          >
            + {t.create}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm md:hidden"
        >
          {open ? t.close : t.menu}
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4">
            {nav.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="mt-2 grid gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  toggleLang();
                  setOpen(false);
                }}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-black text-slate-700"
              >
                {lang === "es" ? "English" : "Español"}
              </button>

              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-black text-slate-700"
              >
                {t.login}
              </Link>

              <Link
                href="/invoice/new"
                onClick={() => setOpen(false)}
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-slate-950 px-4 py-3 text-center text-sm font-black text-white shadow-xl shadow-blue-600/20"
              >
                + {t.create}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}