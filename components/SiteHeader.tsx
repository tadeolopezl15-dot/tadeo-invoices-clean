"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Lang = "es" | "en";

const translations = {
  es: {
    pricing: "Precios",
    clients: "Clientes",
    login: "Login",
    start: "Empezar",
    menu: "Menú",
  },
  en: {
    pricing: "Pricing",
    clients: "Clients",
    login: "Login",
    start: "Get started",
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

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-sm">
            TI
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 md:text-base">
              Tadeo Invoices
            </p>
            <p className="hidden text-xs text-slate-500 sm:block">
              Billing platform
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-3 md:flex">
          <Link
            href="/pricing"
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
          >
            {t.pricing}
          </Link>
          <Link
            href="/clientes"
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
          >
            {t.clients}
          </Link>
          <Link
            href="/login"
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
          >
            {t.login}
          </Link>

          <button
            type="button"
            onClick={toggleLang}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {lang === "es" ? "EN" : "ES"}
          </button>

          <Link
            href="/signup"
            className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            {t.start}
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 md:hidden"
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          {t.menu}
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-4">
            <Link
              href="/pricing"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {t.pricing}
            </Link>
            <Link
              href="/clientes"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {t.clients}
            </Link>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {t.login}
            </Link>

            <button
              type="button"
              onClick={() => {
                toggleLang();
                setOpen(false);
              }}
              className="rounded-xl border border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {lang === "es" ? "English" : "Español"}
            </button>

            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="mt-1 inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
            >
              {t.start}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}