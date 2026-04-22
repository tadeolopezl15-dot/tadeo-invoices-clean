"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useLang } from "@/components/LanguageProvider";

export default function UpdatePasswordScreen() {
  const { t, lang } = useLang();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (password !== confirmPassword) {
        throw new Error(
          lang === "es"
            ? "Las contraseñas no coinciden."
            : "Passwords do not match."
        );
      }

      const supabase = createBrowserClient();

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      setMessage(
        lang === "es"
          ? "Tu contraseña fue actualizada correctamente."
          : "Your password was updated successfully."
      );

      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : lang === "es"
          ? "No se pudo actualizar la contraseña."
          : "Could not update the password.";

      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-slate-950">
        {t.common.updatePassword}
      </h2>

      <p className="mt-2 text-sm leading-7 text-slate-600">
        {lang === "es"
          ? "Escribe tu nueva contraseña para recuperar el acceso a tu cuenta."
          : "Enter your new password to recover access to your account."}
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
            {lang === "es" ? "Nueva contraseña" : "New password"}
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={
              lang === "es"
                ? "Escribe tu nueva contraseña"
                : "Enter your new password"
            }
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {lang === "es" ? "Confirmar contraseña" : "Confirm password"}
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={
              lang === "es"
                ? "Confirma tu nueva contraseña"
                : "Confirm your new password"
            }
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? lang === "es"
              ? "Guardando..."
              : "Saving..."
            : lang === "es"
            ? "Guardar contraseña"
            : "Save password"}
        </button>

        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {t.common.login}
        </Link>
      </form>
    </div>
  );
}