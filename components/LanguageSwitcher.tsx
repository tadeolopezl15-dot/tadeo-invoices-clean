"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-full border border-slate-300 bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
          lang === "en"
            ? "bg-[#2f5d9f] text-white"
            : "text-slate-600 hover:text-black"
        }`}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLang("es")}
        className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
          lang === "es"
            ? "bg-yellow-400 text-black"
            : "text-slate-600 hover:text-black"
        }`}
      >
        ES
      </button>
    </div>
  );
}