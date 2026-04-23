"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="ui-page">
      <div className="ui-shell flex min-h-screen items-center justify-center">
        <div className="ui-card w-full max-w-xl p-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">
            Iniciar sesión
          </h2>

          <p className="mt-3 text-base leading-7 text-slate-600">
            Accede a tu cuenta de Tadeo Invoices.
          </p>

          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="ui-label">Correo</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@email.com"
                className="ui-input"
              />
            </div>

            <div>
              <label className="ui-label">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="ui-input"
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? "Cargando..." : "Iniciar sesión"}
            </button>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Link href="/fargot-password" className="text-sm font-medium text-blue-700">
                ¿Olvidaste tu contraseña?
              </Link>

              <Link href="/signup" className="text-sm font-medium text-slate-700">
                Crear cuenta
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}