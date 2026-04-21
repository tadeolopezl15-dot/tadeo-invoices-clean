"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

type Lang = "es" | "en";

const translations = {
  es: {
    title: "Recuperar contraseña",
    subtitle:
      "Escribe tu correo y te enviaremos un enlace para restablecerla.",
    email: "Correo electrónico",
    emailPlaceholder: "tucorreo@email.com",
    send: "Enviar enlace",
    sending: "Enviando...",
    backLogin: "Volver al login",
    success:
      "Si el correo existe, te enviamos un enlace para restablecer tu contraseña.",
    errorDefault: "No se pudo enviar el correo de recuperación.",
  },
  en: {
    title: "Recover password",
    subtitle:
      "Enter your email and we will send you a link to reset it.",
    email: "Email",
    emailPlaceholder: "youremail@email.com",
    send: "Send link",
    sending: "Sending...",
    backLogin: "Back to login",
    success:
      "If the email exists, we sent you a link to reset your password.",
    errorDefault: "Could not send the recovery email.",
  },
} as const;

export default function ForgotPasswordScreen() {
  const [lang, setLang] = useState<Lang>("es");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("app_lang");
    if (saved === "es" || saved === "en") {
      setLang(saved);
    }
  }, []);

  const t = useMemo(() => translations[lang], [lang]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const supabase = createBrowserClient();

      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/update-password`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        throw error;
      }

      setMessage(t.success);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : t.errorDefault;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-slate-950">
        {t.title}
      </h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">
        {t.subtitle}
      </p>

      {message ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {t.email}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? t.sending : t.send}
        </button>

        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {t.backLogin}
        </Link>
      </form>
    </div>
  );
}