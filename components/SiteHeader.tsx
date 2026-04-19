"use client";

import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function SiteHeader() {
  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold">
          Tadeo Invoices
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>

          <Link href="/invoice" className="hover:underline">
            Invoices
          </Link>

          <Link href="/pricing" className="hover:underline">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}