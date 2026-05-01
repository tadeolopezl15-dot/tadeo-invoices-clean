"use client";

import { useLang } from "@/components/LanguageProvider";

export default function LanguageSwitcher() {
  const { lang, toggleLang } = useLang();

  const currentLang = String(lang);
  const isSpanish = currentLang === "es";

  return (
    <button type="button" onClick={toggleLang} className="btn btn-secondary">
      {isSpanish ? "EN" : "ES"}
    </button>
  );
}