"use client";

import Link from "next/link";
import { useState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function AppHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-sm">
            TI
          </div>

          <div>
            <p className="text-sm font-bold text-slate-950 md:text-base">
              Tadeo Invoices
            </p>
            <p className="text-xs text-slate-500">Billing platform</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <Link href="/" className="btn btn-ghost">
            Home
          </Link>
          <Link href="/pricing" className="btn btn-ghost">
            Pricing
          </Link>
          <Link href="/login" className="btn btn-secondary">
            Login
          </Link>
          <Link href="/signup" className="btn btn-primary">
            Get started
          </Link>
          <LanguageSwitcher />
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="btn btn-secondary md:hidden"
        >
          Menú
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4">
            <Link href="/" className="btn btn-ghost" onClick={() => setOpen(false)}>
              Home
            </Link>
            <Link href="/pricing" className="btn btn-ghost" onClick={() => setOpen(false)}>
              Pricing
            </Link>
            <Link href="/login" className="btn btn-secondary" onClick={() => setOpen(false)}>
              Login
            </Link>
            <Link href="/signup" className="btn btn-primary" onClick={() => setOpen(false)}>
              Get started
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      ) : null}
    </header>
  );
}