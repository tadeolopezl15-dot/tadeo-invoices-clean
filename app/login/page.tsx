"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const redirectedFrom = searchParams.get("redirectedFrom") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (!email.trim()) throw new Error("Enter your email.");
      if (!password.trim()) throw new Error("Enter your password.");

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw new Error(error.message || "Login failed.");
      }

      router.push(redirectedFrom);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-700/25 blur-3xl" />
      </div>

      <section className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-2">
        <div className="hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-400 text-2xl font-black text-slate-950">
              TI
            </div>

            <div>
              <p className="text-3xl font-black leading-none">
                Tadeo
                <br />
                Invoices
              </p>
              <p className="mt-1 text-sm font-bold text-cyan-300">
                Billing SaaS
              </p>
            </div>
          </Link>

          <h1 className="mt-14 max-w-2xl text-6xl font-black leading-tight tracking-tight">
            Welcome back to your
            <span className="block bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              invoice command center.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Sign in to create invoices, send professional emails, download PDFs,
            collect Stripe payments, and manage your business from one secure
            workspace.
          </p>

          <div className="mt-10 grid max-w-xl gap-4 md:grid-cols-3">
            <Feature title="Secure" text="Protected workspace" />
            <Feature title="Fast" text="Instant invoicing" />
            <Feature title="Pro" text="Stripe-ready billing" />
          </div>
        </div>

        <div className="mx-auto w-full max-w-lg">
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400 text-xl font-black text-slate-950">
                TI
              </div>
              <div className="text-left">
                <p className="text-2xl font-black leading-none">
                  Tadeo Invoices
                </p>
                <p className="text-sm font-bold text-cyan-300">Billing SaaS</p>
              </div>
            </Link>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl md:p-8">
            <div className="mb-8">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
                Login
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-tight">
                Access your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Enter your credentials to continue to your dashboard.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm font-bold text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-black text-slate-300">
                  Email address
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@email.com"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-slate-300">
                  Password
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Your password"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                />
              </div>

              <button
                disabled={loading}
                className="w-full rounded-2xl bg-cyan-400 px-6 py-4 text-lg font-black text-slate-950 shadow-2xl shadow-cyan-500/20 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-3 text-center text-sm text-slate-400">
              <p>
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-black text-cyan-300">
                  Create one
                </Link>
              </p>

              <Link href="/" className="font-bold text-slate-300 hover:text-white">
                Back to homepage
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Protected login powered by Supabase Auth.
          </p>
        </div>
      </section>
    </main>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
      <p className="text-lg font-black text-white">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{text}</p>
    </div>
  );
}