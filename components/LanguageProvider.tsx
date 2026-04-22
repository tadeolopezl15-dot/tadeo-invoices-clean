"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Lang = "es" | "en";

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: any;
};

const translations = {
  es: {
    common: {
      login: "Iniciar sesión",
      signup: "Crear cuenta",
      email: "Correo",
      loading: "Cargando...",
      forgotPassword: "¿Olvidaste tu contraseña?",
    },
  },
  en: {
    common: {
      login: "Login",
      signup: "Sign up",
      email: "Email",
      loading: "Loading...",
      forgotPassword: "Forgot password?",
    },
  },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    const saved = localStorage.getItem("app_lang") as Lang | null;
    if (saved) setLangState(saved);
  }, []);

  function setLang(newLang: Lang) {
    setLangState(newLang);
    localStorage.setItem("app_lang", newLang);
    document.documentElement.lang = newLang;
  }

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t: translations[lang],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return ctx;
}