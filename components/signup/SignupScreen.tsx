"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;

    if (userId) {
      await supabase.from("profiles").upsert(
        {
          id: userId,
          full_name: fullName || null,
          company_name: companyName || null,
          role: "member",
        },
        { onConflict: "id" }
      );
    }

    setSuccess("Cuenta creada. Revisa tu correo para confirmar el acceso.");
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="ui-page">
      <div className="ui-shell flex min-h-screen items-center justify-center">
        <div className="ui-card w-full max-w-xl p-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">
            Crear cuenta
          </h2>

          <p className="mt-3 text-base leading-7 text-slate-600">
            Empieza con una experiencia premium de facturación.
          </p>

          {success ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="ui-label">Nombre</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre"
                className="ui-input"
              />
            </div>

            <div>
              <label className="ui-label">Empresa</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Tu empresa"
                className="ui-input"
              />
            </div>

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
              {loading ? "Cargando..." : "Crear cuenta"}
            </button>

            <Link href="/login" className="btn btn-secondary w-full">
              Iniciar sesión
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}