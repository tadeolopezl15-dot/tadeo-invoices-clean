"use client";

import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/components/LanguageProvider";

export default function AppHeader() {
  const { t, lang } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-300 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-black">tadeo</span>
          <span className="rounded-md bg-yellow-400 px-3 py-1 text-2xl font-bold leading-none text-black">
            billing
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          <Link
            href="/dashboard"
            className="text-base font-medium text-slate-700 transition hover:text-black"
          >
            {t.common.dashboard}
          </Link>

          <Link
            href="/invoice"
            className="text-base font-medium text-slate-700 transition hover:text-black"
          >
            {lang === "es" ? "Facturas" : "Invoices"}
          </Link>

          <Link
            href="/pricing"
            className="text-base font-medium text-slate-700 transition hover:text-black"
          >
            {t.common.pricing}
          </Link>

          <Link
            href="/configuracion"
            className="text-base font-medium text-slate-700 transition hover:text-black"
          >
            {t.common.settings}
          </Link>

          <Link
            href="/login"
            className="text-base font-medium text-slate-700 transition hover:text-black"
          >
            {t.common.login}
          </Link>

          <Link
            href="/invoice/new"
            className="inline-flex items-center justify-center rounded-md bg-yellow-400 px-5 py-3 text-base font-semibold text-black transition hover:bg-yellow-300"
          >
            {lang === "es" ? "Crear una factura" : "Create invoice"}
          </Link>

          <LanguageSwitcher />
        </nav>

        <div className="flex items-center gap-3 lg:hidden">
          <LanguageSwitcher />

          <Link
            href="/invoice/new"
            className="inline-flex items-center justify-center rounded-md bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300"
          >
            {lang === "es" ? "Crear" : "Create"}
          </Link>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-4 overflow-x-auto px-4 py-3 text-sm sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="whitespace-nowrap font-medium text-slate-700 transition hover:text-black"
          >
            {t.common.dashboard}
          </Link>

          <Link
            href="/invoice"
            className="whitespace-nowrap font-medium text-slate-700 transition hover:text-black"
          >
            {lang === "es" ? "Facturas" : "Invoices"}
          </Link>

          <Link
            href="/pricing"
            className="whitespace-nowrap font-medium text-slate-700 transition hover:text-black"
          >
            {t.common.pricing}
          </Link>

          <Link
            href="/configuracion"
            className="whitespace-nowrap font-medium text-slate-700 transition hover:text-black"
          >
            {t.common.settings}
          </Link>

          <Link
            href="/login"
            className="whitespace-nowrap font-medium text-slate-700 transition hover:text-black"
          >
            {t.common.login}
          </Link>
        </div>
      </div>
    </header>
  );
}