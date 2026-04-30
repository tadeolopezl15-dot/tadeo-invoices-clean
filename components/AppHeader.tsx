"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        
        {/* LOGO */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 via-blue-900 to-blue-600 text-white font-black shadow-xl">
            TI
            <span className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 transition group-hover:opacity-100" />
          </div>

          <div className="leading-tight">
            <p className="text-sm font-black text-slate-950 md:text-base">
              Tadeo Invoices
            </p>
            <p className="text-xs font-medium text-slate-500">
              SaaS Billing Platform
            </p>
          </div>
        </Link>

        {/* NAV DESKTOP */}
        <nav className="hidden items-center rounded-2xl border border-slate-200 bg-slate-50/80 p-1 shadow-sm lg:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-3 py-2 text-sm font-extrabold transition ${
                  active
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:bg-white hover:text-slate-950"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT */}
        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />

          <Link
            href="/invoice/new"
            className="rounded-2xl bg-gradient-to-r from-blue-600 to-slate-950 px-5 py-3 text-sm font-black text-white shadow-xl transition hover:scale-[1.02]"
          >
            + Crear factura
          </Link>
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black md:hidden"
        >
          {open ? "Cerrar" : "Menú"}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="flex flex-col gap-2 p-4">
            {navLinks.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-black ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="mt-2 border-t pt-3">
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
      )}
    </header>
  );
}