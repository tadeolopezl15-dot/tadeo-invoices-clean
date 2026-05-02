"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

const links: { href: Route; label: string }[] = [
  { href: "/" as Route, label: "Inicio" },
  { href: "/dashboard" as Route, label: "Dashboard" },
  { href: "/invoice" as Route, label: "Facturas" },
  { href: "/pricing" as Route, label: "Precios" },
  { href: "/configuracion" as Route, label: "Configuración" },
];

export default function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href={"/dashboard" as Route} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">
            TI
          </div>

          <div>
            <p className="text-sm font-black leading-none text-slate-950">
              Tadeo Invoices
            </p>
            <p className="text-xs font-medium text-slate-500">
              Billing SaaS
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href={"/invoice/new" as Route}
          className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white shadow-lg shadow-slate-950/10 hover:bg-slate-800"
        >
          Nueva factura
        </Link>
      </div>
    </header>
  );
}