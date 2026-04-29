"use client";

import Link from "next/link";
import { useState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/invoice", label: "Facturas" },
  { href: "/clientes", label: "Clientes" },
  { href: "/reportes", label: "Reportes" },
  { href: "/configuracion", label: "Configuración" },
  { href: "/pricing", label: "Planes" },
];

export default function AppHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 to-blue-700 text-sm font-black text-white shadow-lg shadow-blue-900/20">
            TI
          </div>

          <div className="leading-tight">
            <p className="text-sm font-black text-slate-950 md:text-base">
              Tadeo Invoices
            </p>
            <p className="text-xs font-medium text-slate-500">
              Billing SaaS
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />

          <Link href="/invoice/new" className="btn btn-primary">
            + Crear factura
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm md:hidden"
        >
          {open ? "Cerrar" : "Menú"}
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-2 border-t border-slate-100 pt-3">
              <Link
                href="/invoice/new"
                onClick={() => setOpen(false)}
                className="btn btn-primary w-full"
              >
                + Crear factura
              </Link>

              <div className="mt-3">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}