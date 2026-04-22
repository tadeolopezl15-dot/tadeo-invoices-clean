"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "es" | "en";

type Translations = {
  common: {
    login: string;
    signup: string;
    email: string;
    password: string;
    loading: string;
    forgotPassword: string;
    updatePassword: string;
    logout: string;
    dashboard: string;
    invoices: string;
    clients: string;
    settings: string;
    save: string;
    delete: string;
    paid: string;
    pending: string;
    canceled: string;
    createInvoice: string;
    invoice: string;
    client: string;
    amount: string;
    total: string;
    subtotal: string;
    tax: string;
    status: string;
    issueDate: string;
    dueDate: string;
    date: string;
    description: string;
    qty: string;
    price: string;
    action: string;
    noEmail: string;
    reports: string;
    memberships: string;
    view: string;
    edit: string;
    back: string;
    details: string;
    publicView: string;
    notes: string;
    company: string;
  };
};

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: Translations;
};

const translations: Record<Lang, Translations> = {
  es: {
    common: {
      login: "Iniciar sesión",
      signup: "Crear cuenta",
      email: "Correo",
      password: "Contraseña",
      loading: "Cargando...",
      forgotPassword: "¿Olvidaste tu contraseña?",
      updatePassword: "Actualizar contraseña",
      logout: "Cerrar sesión",
      dashboard: "Panel",
      invoices: "Facturas",
      clients: "Clientes",
      settings: "Configuración",
      save: "Guardar",
      delete: "Eliminar",
      paid: "Pagada",
      pending: "Pendiente",
      canceled: "Cancelada",
      createInvoice: "Crear factura",
      invoice: "Factura",
      client: "Cliente",
      amount: "Monto",
      total: "Total",
      subtotal: "Subtotal",
      tax: "Impuestos",
      status: "Estado",
      issueDate: "Fecha de emisión",
      dueDate: "Fecha de vencimiento",
      date: "Fecha",
      description: "Descripción",
      qty: "Cant.",
      price: "Precio",
      action: "Acción",
      noEmail: "Sin email",
      reports: "Reportes",
      memberships: "Membresías",
      view: "Ver",
      edit: "Editar",
      back: "Volver",
      details: "Detalles",
      publicView: "Vista pública",
      notes: "Notas",
      company: "Empresa",
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
      updatePassword: "Update password",
      logout: "Logout",
      dashboard: "Dashboard",
      invoices: "Invoices",
      clients: "Clients",
      settings: "Settings",
      save: "Save",
      delete: "Delete",
      paid: "Paid",
      pending: "Pending",
      canceled: "Canceled",
      createInvoice: "Create invoice",
      invoice: "Invoice",
      client: "Client",
      amount: "Amount",
      total: "Total",
      subtotal: "Subtotal",
      tax: "Tax",
      status: "Status",
      issueDate: "Issue date",
      dueDate: "Due date",
      date: "Date",
      description: "Description",
      qty: "Qty",
      price: "Price",
      action: "Action",
      noEmail: "No email",
      reports: "Reports",
      memberships: "Memberships",
      view: "View",
      edit: "Edit",
      back: "Back",
      details: "Details",
      publicView: "Public view",
      notes: "Notes",
      company: "Company",
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
    if (saved === "es" || saved === "en") {
      setLangState(saved);
      document.documentElement.lang = saved;
      return;
    }

    document.documentElement.lang = initialLang;
  }, [initialLang]);

  function setLang(newLang: Lang) {
    setLangState(newLang);
    localStorage.setItem("app_lang", newLang);
    document.documentElement.lang = newLang;
  }

  function toggleLang() {
    setLang(lang === "es" ? "en" : "es");
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

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLang must be used inside LanguageProvider");
  }
  return ctx;
}

export function useLanguage() {
  return useLang();
}