"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { useLang } from "@/components/LanguageProvider";

export default function LoginScreen() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const { t } = useLang();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

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
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-slate-950">
        {t.common.login}
      </h2>

      <p className="mt-2 text-sm leading-7 text-slate-600">
        {t.common.login} · Tadeo Invoices
      </p>

      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {t.common.email}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@email.com"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? t.common.loading : t.common.login}
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            {t.common.forgotPassword}
          </Link>

          <Link
            href="/signup"
            className="text-sm font-medium text-slate-700 hover:text-slate-950"
          >
            {t.common.signup}
          </Link>
        </div>
      </form>
    </div>
  );
}