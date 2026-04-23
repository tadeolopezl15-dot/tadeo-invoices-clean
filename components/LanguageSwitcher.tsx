"use client";

import { useLang } from "@/components/LanguageProvider";

export default function LanguageSwitcher() {
  const { lang, toggleLang } = useLang();

  return (
    <button type="button" onClick={toggleLang} className="btn btn-secondary">
      {lang === "es" ? "EN" : "ES"}
    </button>
  );
}