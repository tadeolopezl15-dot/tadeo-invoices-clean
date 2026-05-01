"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useLang } from "@/components/LanguageProvider";

export default function UpdatePasswordScreen() {
  const { lang } = useLang();

  const currentLang = String(lang);
  const isSpanish = currentLang === "es";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");
    setLoading(true);

    try {
      if (password.length < 6) {
        throw new Error(
          isSpanish
            ? "La contraseña debe tener al menos 6 caracteres."
            : "Password must be at least 6 characters."
        );
      }

      if (password !== confirmPassword) {
        throw new Error(
          isSpanish
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
        isSpanish
          ? "Tu contraseña fue actualizada correctamente. Ya puedes iniciar sesión."
          : "Your password has been updated successfully. You can now sign in."
      );

      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      const fallback = isSpanish
        ? "No pudimos actualizar tu contraseña. Abre el enlace nuevamente desde tu correo."
        : "We could not update your password. Open the link again from your email.";

      setErrorMessage(error instanceof Error ? error.message : fallback);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/40 backdrop-blur md:grid-cols-2">
          <section className="hidden bg-gradient-to-br from-emerald-600 via-blue-600 to-slate-950 p-10 md:block">
            <div className="flex h-full flex-col justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-100">
                  Tadeo Invoices
                </p>
                <h1 className="mt-8 text-4xl font-black leading-tight">
                  {isSpanish
                    ? "Crea una nueva contraseña segura."
                    : "Create a new secure password."}
                </h1>
                <p className="mt-5 max-w-md text-base leading-7 text-emerald-100">
                  {isSpanish
                    ? "Actualiza tu contraseña y vuelve a administrar tus facturas, clientes y pagos."
                    : "Update your password and get back to managing invoices, clients, and payments."}
                </p>
              </div>

              <div className="rounded-3xl border border-white/15 bg-white/10 p-5">
                <p className="text-sm text-emerald-100">
                  {isSpanish
                    ? "Usa una contraseña fuerte con mínimo 6 caracteres."
                    : "Use a strong password with at least 6 characters."}
                </p>
              </div>
            </div>
          </section>

          <section className="p-8 sm:p-10">
            <div className="mx-auto max-w-md">
              <Link
                href="/login"
                className="inline-flex text-sm font-semibold text-blue-300 hover:text-blue-200"
              >
                ← {isSpanish ? "Volver al login" : "Back to login"}
              </Link>

              <h2 className="mt-8 text-3xl font-black">
                {isSpanish ? "Actualizar contraseña" : "Update password"}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                {isSpanish
                  ? "Escribe tu nueva contraseña para recuperar el acceso a tu cuenta."
                  : "Enter your new password to recover access to your account."}
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="text-sm font-semibold text-slate-200">
                    {isSpanish ? "Nueva contraseña" : "New password"}
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none ring-blue-500/40 placeholder:text-slate-500 focus:ring-4"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-200">
                    {isSpanish ? "Confirmar contraseña" : "Confirm password"}
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="••••••••"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none ring-blue-500/40 placeholder:text-slate-500 focus:ring-4"
                  />
                </div>

                {message ? (
                  <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    {message}
                  </div>
                ) : null}

                {errorMessage ? (
                  <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {errorMessage}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-blue-500 px-5 py-3 font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? isSpanish
                      ? "Actualizando..."
                      : "Updating..."
                    : isSpanish
                      ? "Actualizar contraseña"
                      : "Update password"}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}