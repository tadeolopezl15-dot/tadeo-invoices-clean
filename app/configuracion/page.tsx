"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Lang = "es" | "en";

const translations = {
  es: {
    badge: "Configuración",
    title: "Personaliza tu espacio de trabajo",
    subtitle:
      "Administra la imagen de tu negocio, tus preferencias y la información que usas en tus facturas.",
    companyInfo: "Información de la empresa",
    companyName: "Nombre de la empresa",
    companyEmail: "Correo de la empresa",
    companyPhone: "Teléfono",
    companyAddress: "Dirección",
    logo: "Logo",
    uploadLogo: "Subir logo",
    save: "Guardar cambios",
    billing: "Facturación",
    billingText:
      "Ajusta cómo se muestran tus datos comerciales y tu imagen en las facturas.",
    integrations: "Integraciones",
    integrationsText:
      "Conecta Stripe y administra la experiencia de cobro para tus membresías y pagos.",
    backDashboard: "Volver al dashboard",
    successNote: "Tus cambios se reflejarán en tu experiencia de facturación.",
  },
  en: {
    badge: "Settings",
    title: "Customize your workspace",
    subtitle:
      "Manage your business image, preferences, and the information you use in your invoices.",
    companyInfo: "Company information",
    companyName: "Company name",
    companyEmail: "Company email",
    companyPhone: "Phone",
    companyAddress: "Address",
    logo: "Logo",
    uploadLogo: "Upload logo",
    save: "Save changes",
    billing: "Billing",
    billingText:
      "Adjust how your business data and branding appear on invoices.",
    integrations: "Integrations",
    integrationsText:
      "Connect Stripe and manage the payment experience for memberships and payments.",
    backDashboard: "Back to dashboard",
    successNote: "Your changes will be reflected in your invoicing experience.",
  },
} as const;

export default function ConfiguracionPage() {
  const [lang, setLang] = useState<Lang>("es");

  useEffect(() => {
    const saved = localStorage.getItem("app_lang");
    if (saved === "es" || saved === "en") {
      setLang(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const t = useMemo(() => translations[lang], [lang]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_45%,_#ffffff_100%)] px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                {t.badge}
              </p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                {t.title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                {t.subtitle}
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {t.backDashboard}
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-950">
              {t.companyInfo}
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.companyName}
                </label>
                <input
                  type="text"
                  placeholder={t.companyName}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.companyEmail}
                </label>
                <input
                  type="email"
                  placeholder={t.companyEmail}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.companyPhone}
                </label>
                <input
                  type="text"
                  placeholder={t.companyPhone}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.companyAddress}
                </label>
                <input
                  type="text"
                  placeholder={t.companyAddress}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                {t.logo}
              </label>
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <p className="text-sm text-slate-500">{t.uploadLogo}</p>
              </div>
            </div>

            <button
              type="button"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {t.save}
            </button>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-xl font-bold text-slate-950">{t.billing}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {t.billingText}
              </p>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-xl font-bold text-slate-950">
                {t.integrations}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {t.integrationsText}
              </p>
            </div>

            <div className="rounded-[30px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm sm:p-6">
              <p className="text-sm font-medium text-emerald-800">
                {t.successNote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}