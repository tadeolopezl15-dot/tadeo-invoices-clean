"use client";

import { useEffect, useMemo, useState } from "react";
import NewInvoiceScreen from "@/components/invoice/NewInvoiceScreen";

type Lang = "es" | "en";

const translations = {
  es: {
    title: "Nueva factura",
    subtitle:
      "Crea una factura optimizada para móvil y escritorio con una experiencia profesional.",
  },
  en: {
    title: "New invoice",
    subtitle:
      "Create an invoice optimized for mobile and desktop with a professional experience.",
  },
} as const;

export default function NewInvoicePage() {
  const [lang, setLang] = useState<Lang>("es");

  useEffect(() => {
    const saved = localStorage.getItem("app_lang");
    if (saved === "es" || saved === "en") {
      setLang(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const t = useMemo(() => translations[lang], [lang]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_45%,_#ffffff_100%)] px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            {t.title}
          </h1>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            {t.subtitle}
          </p>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
          <NewInvoiceScreen />
        </div>
      </div>
    </main>
  );
}