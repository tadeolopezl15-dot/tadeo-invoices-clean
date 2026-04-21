"use client";

import { useLang } from "@/components/LanguageProvider";

export default function LanguageSwitcher() {
  const { lang, toggleLang } = useLang();

  return (
    <button
      type="button"
      onClick={toggleLang}
      className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      aria-label="Switch language"
    >
      {lang === "es" ? "EN" : "ES"}
    </button>
  );
}