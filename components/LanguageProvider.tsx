"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Lang } from "@/lib/i18n";
import { defaultLang, getTranslation } from "@/lib/i18n";

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: ReturnType<typeof getTranslation> & { lang: Lang };
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(defaultLang);

  useEffect(() => {
    const saved = localStorage.getItem("app_lang") as Lang | null;

    if (saved === "en" || saved === "es") {
      setLangState(saved);
      document.documentElement.lang = saved;
    } else {
      document.documentElement.lang = String(defaultLang);
    }
  }, []);

  const setLang = (nextLang: Lang) => {
    setLangState(nextLang);
    localStorage.setItem("app_lang", String(nextLang));
    document.documentElement.lang = String(nextLang);
  };

  const toggleLang = () => {
    const currentLang = String(lang);
    setLang((currentLang === "es" ? "en" : "es") as Lang);
  };

  const value = useMemo(() => {
    return {
      lang,
      setLang,
      toggleLang,
      t: {
        ...getTranslation(lang),
        lang,
      },
    };
  }, [lang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}

export const useLang = useLanguage;