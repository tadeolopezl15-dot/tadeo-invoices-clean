"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Lang = "es" | "en";

const translations = {
  es: {
    dashboard: "Dashboard",
    invoices: "Facturas",
    clients: "Clientes",
    pricing: "Planes",
    login: "Login",
    start: "Empezar",
    create: "Crear factura",
    menu: "Menú",
  },
  en: {
    dashboard: "Dashboard",
    invoices: "Invoices",
    clients: "Clients",
    pricing: "Pricing",
    login: "Login",
    start: "Get started",
    create: "New invoice",
    menu: "Menu",
  },
} as const;

export default function SiteHeader() {
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
    { href: "/pricing", label: t.pricing },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 to-blue-700 text-white font-black shadow-lg">
            TI
          </div>
          <div>
            <p className="text-sm font-black text-slate-950">
              Tadeo Invoices
            </p>
            <p className="text-xs text-slate-500 hidden sm:block">
              SaaS Billing Platform
            </p>
          </div>
        </Link>

        {/* NAV DESKTOP */}
        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* RIGHT */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="rounded-xl border px-3 py-2 text-sm font-bold"
          >
            {lang === "es" ? "EN" : "ES"}
          </button>

          <Link href="/login" className="btn btn-secondary">
            {t.login}
          </Link>

          <Link href="/invoice/new" className="btn btn-primary">
            + {t.create}
          </Link>
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden rounded-xl border px-3 py-2 text-sm font-bold"
        >
          {open ? "Cerrar" : t.menu}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="flex flex-col gap-2 p-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}

            <button
              onClick={() => {
                toggleLang();
                setOpen(false);
              }}
              className="rounded-xl border px-4 py-3 text-left text-sm font-bold"
            >
              {lang === "es" ? "English" : "Español"}
            </button>

            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="btn btn-secondary w-full"
            >
              {t.login}
            </Link>

            <Link
              href="/invoice/new"
              onClick={() => setOpen(false)}
              className="btn btn-primary w-full"
            >
              + {t.create}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}