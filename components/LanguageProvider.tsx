"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Lang } from "@/lib/i18n";
import { defaultLang, getTranslation } from "@/lib/i18n";

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: ReturnType<typeof getTranslation> & { lang: Lang };
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(defaultLang);

  useEffect(() => {
    const saved = localStorage.getItem("app_lang");

    if (saved === "es" || saved === "en") {
      setLangState(saved);
      document.documentElement.lang = saved;
      return;
    }

    document.documentElement.lang = defaultLang;
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("app_lang", newLang);
    document.documentElement.lang = newLang;
  };

  const value = useMemo<LanguageContextType>(() => {
    return {
      lang,
      setLang,
      t: {
        ...getTranslation(lang),
        lang,
      },
    };
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}