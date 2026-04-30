"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { getTranslation } from "@/lib/i18n";

type LanguageContextType = {
  lang: "en";
  t: ReturnType<typeof getTranslation>;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = "en";

  const t = useMemo(() => getTranslation(lang), []);

  return (
    <LanguageContext.Provider value={{ lang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("LanguageProvider missing");
  return ctx;
}