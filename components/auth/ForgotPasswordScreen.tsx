"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useLang } from "@/components/LanguageProvider";

export default function ForgotPasswordScreen() {
  const { lang } = useLang();

  const currentLang = String(lang);
  const isSpanish = currentLang === "es";

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

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
        setError(
          isSpanish
            ? "No pudimos enviar el enlace. Verifica el correo e intenta otra vez."
            : "We could not send the link. Check the email and try again."
        );
        return;
      }

      setMessage(
        isSpanish
          ? "Si el correo existe, te enviamos un enlace para restablecer tu contraseña."
          : "If the email exists, we sent you a link to reset your password."
      );
    } catch {
      setError(
        isSpanish
          ? "Ocurrió un error inesperado. Intenta nuevamente."
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/40 backdrop-blur md:grid-cols-2">
          <section className="hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-950 p-10 md:block">
            <div className="flex h-full flex-col justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-100">
                  Tadeo Invoices
                </p>
                <h1 className="mt-8 text-4xl font-black leading-tight">
                  {isSpanish
                    ? "Recupera el acceso a tu cuenta."
                    : "Recover access to your account."}
                </h1>
                <p className="mt-5 max-w-md text-base leading-7 text-blue-100">
                  {isSpanish
                    ? "Te enviaremos un enlace seguro para crear una nueva contraseña y volver a tu dashboard."
                    : "We will send you a secure link to create a new password and return to your dashboard."}
                </p>
              </div>

              <div className="rounded-3xl border border-white/15 bg-white/10 p-5">
                <p className="text-sm text-blue-100">
                  {isSpanish
                    ? "Protegido con autenticación segura de Supabase."
                    : "Protected with secure Supabase authentication."}
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
                {isSpanish ? "Olvidé mi contraseña" : "Forgot password"}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                {isSpanish
                  ? "Escribe tu correo y te enviaremos un enlace para cambiar tu contraseña."
                  : "Enter your email and we will send you a link to change your password."}
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="text-sm font-semibold text-slate-200">
                    {isSpanish ? "Correo electrónico" : "Email address"}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none ring-blue-500/40 placeholder:text-slate-500 focus:ring-4"
                  />
                </div>

                {message ? (
                  <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    {message}
                  </div>
                ) : null}

                {error ? (
                  <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-blue-500 px-5 py-3 font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? isSpanish
                      ? "Enviando..."
                      : "Sending..."
                    : isSpanish
                      ? "Enviar enlace"
                      : "Send reset link"}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}