"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Lang = "es" | "en";

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: any;
};

const translations = {
  es: {
    common: {
      login: "Iniciar sesión",
      signup: "Crear cuenta",
      email: "Correo",
      password: "Contraseña",
      loading: "Cargando...",
      forgotPassword: "¿Olvidaste tu contraseña?",
      logout: "Cerrar sesión",
      dashboard: "Panel",
      invoices: "Facturas",
      clients: "Clientes",
      settings: "Configuración",
      save: "Guardar",
      delete: "Eliminar",
    },
  },
  en: {
    common: {
      login: "Login",
      signup: "Sign up",
      email: "Email",
      password: "Password",
      loading: "Loading...",
      forgotPassword: "Forgot password?",
      logout: "Logout",
      dashboard: "Dashboard",
      invoices: "Invoices",
      clients: "Clients",
      settings: "Settings",
      save: "Save",
      delete: "Delete",
    },
  },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({
  children,
  initialLang = "es",
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    const saved = localStorage.getItem("app_lang") as Lang | null;
    if (saved) setLangState(saved);
  }, []);

  function setLang(newLang: Lang) {
    setLangState(newLang);
    localStorage.setItem("app_lang", newLang);
    document.documentElement.lang = newLang;
  }

  function toggleLang() {
    const newLang = lang === "es" ? "en" : "es";
    setLang(newLang);
  }

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
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

// compatibilidad con tu código actual
export const useLang = useLanguage;