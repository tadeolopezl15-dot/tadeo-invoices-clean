"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/invoice", label: "Invoices" },
  { href: "/clientes", label: "Clients" },
  { href: "/reportes", label: "Reports" },
  { href: "/configuracion", label: "Settings" },
  { href: "/pricing", label: "Pricing" },
];

export default function AppHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 to-blue-700 text-white font-black">
            TI
          </div>

          <div>
            <p className="text-sm font-black text-slate-950">
              Tadeo Invoices
            </p>
            <p className="text-xs text-slate-500">
              SaaS Billing Platform
            </p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-3 py-2 text-sm font-bold ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/invoice/new" className="btn btn-primary">
            + Create invoice
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden border px-4 py-2 rounded-xl"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="flex flex-col gap-2 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 text-sm font-bold hover:bg-slate-100 rounded-xl"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/invoice/new"
              className="btn btn-primary w-full"
            >
              + Create invoice
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}