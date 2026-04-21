"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

type Lang = "es" | "en";

const translations = {
  es: {
    title: "Actualizar contraseña",
    subtitle:
      "Escribe tu nueva contraseña para recuperar el acceso a tu cuenta.",
    password: "Nueva contraseña",
    confirmPassword: "Confirmar contraseña",
    passwordPlaceholder: "Escribe tu nueva contraseña",
    confirmPlaceholder: "Confirma tu nueva contraseña",
    save: "Guardar contraseña",
    saving: "Guardando...",
    backLogin: "Volver al login",
    success: "Tu contraseña fue actualizada correctamente.",
    mismatch: "Las contraseñas no coinciden.",
    errorDefault: "No se pudo actualizar la contraseña.",
  },
  en: {
    title: "Update password",
    subtitle:
      "Enter your new password to recover access to your account.",
    password: "New password",
    confirmPassword: "Confirm password",
    passwordPlaceholder: "Enter your new password",
    confirmPlaceholder: "Confirm your new password",
    save: "Save password",
    saving: "Saving...",
    backLogin: "Back to login",
    success: "Your password was updated successfully.",
    mismatch: "Passwords do not match.",
    errorDefault: "Could not update the password.",
  },
} as const;

export default function UpdatePasswordScreen() {
  const [lang, setLang] = useState<Lang>("es");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
      if (password !== confirmPassword) {
        throw new Error(t.mismatch);
      }

      const supabase = createBrowserClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      setMessage(t.success);
      setPassword("");
      setConfirmPassword("");
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
            {t.password}
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.passwordPlaceholder}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {t.confirmPassword}
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t.confirmPlaceholder}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? t.saving : t.save}
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