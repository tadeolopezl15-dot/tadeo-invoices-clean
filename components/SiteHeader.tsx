"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLang } from "@/components/LanguageProvider";

function Flag({ code }: { code: string }) {
  return <span className="flag-pill">{code}</span>;
}

export function SiteHeader() {
  const { t } = useLang();

  return (
    <header className="site-header">
      <div className="container nav-row">
        <Link href="/" className="logo">
          <span className="logo-black">invoice</span>
          <span className="logo-yellow">home</span>
        </Link>

        <nav className="nav-actions">
          <div className="flags">
            <Flag code="EN" />
            <Flag code="ES" />
            <Flag code="FR" />
            <Flag code="DE" />
            <Flag code="IT" />
            <Flag code="PT" />
          </div>

          <LanguageSwitcher />

          <Link href="/pricing" className="nav-link">
            Pricing
          </Link>

          <Link href="/dashboard" className="nav-link">
            {t("dashboard")}
          </Link>

          <Link href="/login" className="nav-link">
            Login
          </Link>

          <Link href="/invoice/new" className="yellow-btn">
            {t("newInvoice")}
          </Link>
        </nav>
      </div>
    </header>
  );
}