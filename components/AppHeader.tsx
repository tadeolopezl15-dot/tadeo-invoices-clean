"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
  },
  {
    href: "/invoice",
    label: "Invoices",
  },
  {
    href: "/pricing",
    label: "Pricing",
  },
  {
    href: "/configuracion",
    label: "Settings",
  },
];

export default function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 px-4 py-5">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-[2rem] border border-slate-200 bg-white/90 px-5 py-5 shadow-2xl shadow-slate-200/60 backdrop-blur-xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#020617] text-3xl font-black text-white">
            TI
          </div>

          <div>
            <p className="text-[2rem] font-black leading-none text-slate-950">
              Tadeo
              <br />
              Invoices
            </p>

            <p className="text-sm font-semibold text-slate-500">
              Billing SaaS
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-2 lg:flex">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              pathname.startsWith(link.href + "/");

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-2xl px-6 py-4 text-lg font-black transition-all duration-200 ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-950 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <Link
          href="/invoice/new"
          className="rounded-2xl bg-blue-700 px-8 py-5 text-xl font-black text-white shadow-2xl shadow-blue-700/30 transition-all duration-200 hover:scale-105 hover:bg-blue-600"
        >
          + New invoice
        </Link>
      </div>
    </header>
  );
}