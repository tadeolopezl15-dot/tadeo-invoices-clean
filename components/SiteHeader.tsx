"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

const menu: { href: Route; label: string }[] = [
  { href: "/" as Route, label: "Inicio" },
  { href: "/pricing" as Route, label: "Precios" },
  { href: "/login" as Route, label: "Login" },
  { href: "/signup" as Route, label: "Registro" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* LOGO */}
        <Link href={"/" as Route} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400 text-sm font-black text-slate-950">
            TI
          </div>

          <div>
            <p className="text-sm font-black text-white">
              Tadeo Invoices
            </p>
            <p className="text-xs text-slate-400">
              Billing SaaS
            </p>
          </div>
        </Link>

        {/* MENU */}
        <nav className="hidden items-center gap-2 md:flex">
          {menu.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2 text-sm font-extrabold transition ${
                  active
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <Link
          href={"/invoice/new" as Route}
          className="rounded-2xl bg-cyan-400 px-5 py-2 text-sm font-black text-slate-950 hover:bg-cyan-300"
        >
          Crear factura
        </Link>
      </div>
    </header>
  );
}