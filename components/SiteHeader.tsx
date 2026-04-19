"use client";

import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLang } from "@/components/LanguageProvider";

function Flag({ code }: { code: string }) {
  return (
    <span className="text-lg">
      {code === "en" ? "🇺🇸" : "🇪🇸"}
    </span>
  );
}

export default function SiteHeader() {
  const { lang, setLang } = useLang();

  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        
        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          Tadeo Invoices
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          <Link href="/dashboard" className="hover:underline">
            {lang === "es" ? "Panel" : "Dashboard"}
          </Link>

          <Link href="/invoice" className="hover:underline">
            {lang === "es" ? "Facturas" : "Invoices"}
          </Link>

          <Link href="/pricing" className="hover:underline">
            {lang === "es" ? "Precios" : "Pricing"}
          </Link>
        </nav>

        {/* Language + Switch */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            className="flex items-center gap-1 rounded-lg border px-2 py-1 text-sm"
          >
            <Flag code={lang} />
            {lang.toUpperCase()}
          </button>

          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}