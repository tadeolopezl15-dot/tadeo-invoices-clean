"use client";

import Link from "next/link";
import { useState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/components/LanguageProvider";

export default function AppHeader() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-sm">
            TI
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950 md:text-base">
              Tadeo Invoices
            </p>
            <p className="hidden text-xs text-slate-500 sm:block">
              Billing platform
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <Link href="/" className="ui-btn ui-btn-ghost">
            Home
          </Link>
          <Link href="/pricing" className="ui-btn ui-btn-ghost">
            Pricing
          </Link>
          <Link href="/login" className="ui-btn ui-btn-secondary">
            {t.common.login}
          </Link>
          <Link href="/signup" className="ui-btn ui-btn-primary">
            Get started
          </Link>
          <LanguageSwitcher />
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="ui-btn ui-btn-secondary md:hidden"
        >
          Menu
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4">
            <Link href="/" className="ui-btn ui-btn-ghost" onClick={() => setOpen(false)}>
              Home
            </Link>
            <Link href="/pricing" className="ui-btn ui-btn-ghost" onClick={() => setOpen(false)}>
              Pricing
            </Link>
            <Link href="/login" className="ui-btn ui-btn-secondary" onClick={() => setOpen(false)}>
              {t.common.login}
            </Link>
            <Link href="/signup" className="ui-btn ui-btn-primary" onClick={() => setOpen(false)}>
              Get started
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      ) : null}
    </header>
  );
}