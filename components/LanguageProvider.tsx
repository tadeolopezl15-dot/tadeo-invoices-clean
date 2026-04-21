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
  t: ReturnType<typeof getTranslation>;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(defaultLang);

  useEffect(() => {
    const saved = localStorage.getItem("app_lang") as Lang | null;

    if (saved === "es" || saved === "en") {
      setLangState(saved);
      document.documentElement.lang = saved;
    } else {
      document.documentElement.lang = defaultLang;
    }
  }, []);

  function setLang(nextLang: Lang) {
    setLangState(nextLang);
    localStorage.setItem("app_lang", nextLang);
    document.documentElement.lang = nextLang;
  }

  function toggleLang() {
    setLang(lang === "es" ? "en" : "es");
  }

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggleLang,
      t: getTranslation(lang),
    }),
    [lang]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLang must be used inside LanguageProvider");
  }

  return context;
}