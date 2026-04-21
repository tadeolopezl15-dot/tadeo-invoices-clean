"use client";

import { useEffect, useMemo, useState } from "react";
import ForgotPasswordScreen from "@/components/auth/ForgotPasswordScreen";

type Lang = "es" | "en";

const translations = {
  es: {
    badge: "Recuperar acceso",
    title: "Restablece tu contraseña",
    subtitle:
      "Te ayudamos a recuperar el acceso a tu cuenta para que puedas volver a facturar.",
  },
  en: {
    badge: "Recover access",
    title: "Reset your password",
    subtitle:
      "We help you recover access to your account so you can get back to invoicing.",
  },
} as const;

export default function ForgotPasswordPage() {
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_45%,_#ffffff_100%)] px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_460px] lg:gap-12">
          <div className="hidden lg:block">
            <div className="max-w-xl">
              <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                {t.badge}
              </p>
              <h1 className="mt-5 text-5xl font-bold tracking-tight text-slate-950">
                {t.title}
              </h1>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                {t.subtitle}
              </p>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-6 md:p-8">
            <ForgotPasswordScreen />
          </div>
        </div>
      </div>
    </main>
  );
}