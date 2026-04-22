"use client";

import Link from "next/link";
import { useState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/components/LanguageProvider";

export default function AppHeader() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

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
            href="/dashboard"
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
          >
            {t.common.dashboard}
          </Link>
          <Link
            href="/invoice"
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
          >
            {t.common.invoices}
          </Link>
          <Link
            href="/clientes"
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
          >
            {t.common.clients}
          </Link>
          <Link
            href="/configuracion"
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
          >
            {t.common.settings}
          </Link>

          <LanguageSwitcher />
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 md:hidden"
        >
          Menu
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-4">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {t.common.dashboard}
            </Link>
            <Link
              href="/invoice"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {t.common.invoices}
            </Link>
            <Link
              href="/clientes"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {t.common.clients}
            </Link>
            <Link
              href="/configuracion"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {t.common.settings}
            </Link>

            <div className="pt-1">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}