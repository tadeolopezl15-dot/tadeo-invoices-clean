"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

type ForgotPasswordScreenProps = {
  action: (formData: FormData) => void | Promise<void>;
  errorMessage?: string;
  successMessage?: string;
};

type Lang = "es" | "en";

const copy = {
  es: {
    badge: "Recuperación segura",
    heroEyebrow: "restablece tu acceso",
    heroTitleA: "Recupera tu cuenta con una experiencia",
    heroTitleB: "clara, rápida y profesional",
    heroDesc:
      "Envía un enlace de recuperación a tu correo para volver a acceder a tu panel sin complicaciones.",

    feature1Title: "Proceso seguro",
    feature1Desc:
      "El enlace de recuperación se envía directamente al correo del usuario.",
    feature2Title: "Acceso rápido",
    feature2Desc:
      "Restablece tu contraseña y vuelve a tu panel en pocos pasos.",
    feature3Title: "Experiencia pro",
    feature3Desc:
      "La recuperación mantiene el mismo estilo premium del resto de tu app.",

    secureAccess: "recuperación segura",
    title: "¿Olvidaste tu contraseña?",
    desc:
      "Escribe tu correo electrónico y te enviaremos un enlace para restablecerla.",
    email: "Correo electrónico",
    emailPlaceholder: "tu@email.com",
    submit: "Enviar enlace",
    submitting: "Enviando enlace...",
    backLogin: "Volver a iniciar sesión",
    createAccount: "Crear cuenta",
    noAccount: "¿No tienes cuenta?",
    secure: "Seguro",
    support: "Acceso protegido",
    supportDesc:
      "Tu cuenta puede recuperarse de forma segura desde tu correo.",
    metric1: "Soporte",
    metric2: "Seguridad",
    metric3: "Acceso",
  },
  en: {
    badge: "Secure recovery",
    heroEyebrow: "restore your access",
    heroTitleA: "Recover your account with a",
    heroTitleB: "clear, fast, and professional experience",
    heroDesc:
      "Send a recovery link to your email so you can access your dashboard again without friction.",

    feature1Title: "Secure process",
    feature1Desc:
      "The recovery link is sent directly to the user's email address.",
    feature2Title: "Fast access",
    feature2Desc:
      "Reset your password and get back into your dashboard in just a few steps.",
    feature3Title: "Pro experience",
    feature3Desc:
      "Recovery keeps the same premium style as the rest of your app.",

    secureAccess: "secure recovery",
    title: "Forgot your password?",
    desc:
      "Enter your email address and we will send you a link to reset it.",
    email: "Email address",
    emailPlaceholder: "you@email.com",
    submit: "Send link",
    submitting: "Sending link...",
    backLogin: "Back to sign in",
    createAccount: "Create account",
    noAccount: "Don’t have an account?",
    secure: "Secure",
    support: "Protected access",
    supportDesc:
      "Your account can be securely recovered from your email.",
    metric1: "Support",
    metric2: "Security",
    metric3: "Access",
  },
} as const;

export default function ForgotPasswordScreen({
  action,
  errorMessage = "",
  successMessage = "",
}: ForgotPasswordScreenProps) {
  const [lang, setLang] = useState<Lang>("es");

  useEffect(() => {
    const syncLang = () => {
      const saved =
        typeof window !== "undefined"
          ? (localStorage.getItem("app_lang") as Lang | null)
          : null;

      if (saved === "es" || saved === "en") {
        setLang(saved);
      } else {
        setLang("es");
      }
    };

    syncLang();

    window.addEventListener("storage", syncLang);
    window.addEventListener("app-language-changed", syncLang as EventListener);

    return () => {
      window.removeEventListener("storage", syncLang);
      window.removeEventListener(
        "app-language-changed",
        syncLang as EventListener
      );
    };
  }, []);

  const t = useMemo(() => copy[lang], [lang]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#040714] text-white">
      <BackgroundDecor />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1700px] lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden lg:flex">
          <div className="flex w-full flex-col justify-between px-10 py-10 xl:px-16 xl:py-14">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
                </span>
                <span className="text-sm font-medium text-white/75">
                  {t.badge}
                </span>
              </div>

              <div className="mt-10 max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.30em] text-cyan-300/80">
                  {t.heroEyebrow}
                </p>

                <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-tight xl:text-7xl">
                  {t.heroTitleA}
                  <span className="mt-3 block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                    {t.heroTitleB}
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-white/58 xl:text-lg">
                  {t.heroDesc}
                </p>
              </div>

              <div className="mt-10 grid max-w-4xl grid-cols-1 gap-4 xl:grid-cols-3">
                <FeatureCard
                  icon={<ShieldIcon />}
                  title={t.feature1Title}
                  desc={t.feature1Desc}
                />
                <FeatureCard
                  icon={<BoltIcon />}
                  title={t.feature2Title}
                  desc={t.feature2Desc}
                />
                <FeatureCard
                  icon={<SparklesIcon />}
                  title={t.feature3Title}
                  desc={t.feature3Desc}
                />
              </div>
            </div>

            <div className="mt-12 rounded-[34px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.40)] backdrop-blur-2xl">
              <div className="grid gap-4 xl:grid-cols-3">
                <MiniStat label={t.metric1} value="24/7" />
                <MiniStat label={t.metric2} value="100%" />
                <MiniStat label={t.metric3} value="Pro" />
              </div>

              <div className="mt-5 rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-white/35">
                  {t.support}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  {t.secureAccess}
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/55">
                  {t.supportDesc}
                </p>

                <div className="mt-5 flex h-24 items-end gap-2">
                  <Bar h="h-8" />
                  <Bar h="h-10" />
                  <Bar h="h-12" />
                  <Bar h="h-16" />
                  <Bar h="h-20" />
                  <Bar h="h-24" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center px-5 py-10 sm:px-8 lg:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.14),transparent_30%)]" />

          <div className="relative w-full max-w-lg">
            <div className="absolute -inset-8 rounded-[40px] bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-violet-500/10 blur-3xl" />

            <div className="relative rounded-[34px] border border-white/10 bg-white/[0.07] p-2 shadow-[0_35px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
              <div className="rounded-[30px] bg-white px-6 py-7 text-slate-900 sm:px-8 sm:py-8">
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      {t.secureAccess}
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2rem]">
                      {t.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {t.desc}
                    </p>
                  </div>

                  <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#020617,#0f172a,#334155)] text-white shadow-xl sm:flex">
                    <span className="text-lg font-bold tracking-tight">T</span>
                  </div>
                </div>

                {errorMessage && (
                  <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 shadow-sm">
                    {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm">
                    {successMessage}
                  </div>
                )}

                <form action={action} className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-slate-700"
                    >
                      {t.email}
                    </label>

                    <div className="group relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-slate-700">
                        <MailIcon />
                      </span>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder={t.emailPlaceholder}
                        autoComplete="email"
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-[15px] outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-sm text-slate-600">{t.supportDesc}</p>
                    <div className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.20em] text-emerald-700">
                      {t.secure}
                    </div>
                  </div>

                  <SubmitButton submitText={t.submit} loadingText={t.submitting} />
                </form>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    {t.backLogin}
                  </Link>

                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    {t.createAccount}
                  </Link>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <QuickInfo label={t.metric1} value="24/7" />
                  <QuickInfo label={t.metric2} value="100%" />
                  <QuickInfo label={t.metric3} value="Pro" />
                </div>

                <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-center text-sm text-slate-600">
                    {t.noAccount}{" "}
                    <Link
                      href="/signup"
                      className="font-semibold text-slate-950 transition hover:text-slate-700"
                    >
                      {t.createAccount}
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SubmitButton({
  submitText,
  loadingText,
}: {
  submitText: string;
  loadingText: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#020617,#111827,#1e293b)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.28)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_rgba(15,23,42,0.36)] focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:translate-y-0"
    >
      {pending ? (
        <>
          <Spinner />
          {loadingText}
        </>
      ) : (
        <>
          {submitText}
          <span className="transition group-hover:translate-x-0.5">→</span>
        </>
      )}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.20)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.06]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/15 to-violet-400/15 ring-1 ring-white/10 text-white/85">
        {icon}
      </div>
      <p className="text-base font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-white/55">{desc}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/35">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function QuickInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.20em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Bar({ h }: { h: string }) {
  return (
    <div
      className={`w-full ${h} rounded-t-2xl bg-gradient-to-t from-cyan-400 via-blue-500 to-violet-500 shadow-[0_10px_30px_rgba(59,130,246,0.30)] opacity-95`}
    />
  );
}

function BackgroundDecor() {
  return (
    <>
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute right-0 top-0 h-[28rem] w-[28rem] rounded-full bg-violet-500/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.14]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent,rgba(0,0,0,0.22))]" />
    </>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6h16v12H4z" />
      <path d="m4 8 8 6 8-6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l7 3v6c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V6l7-3z" />
      <path d="m9.5 12 1.7 1.7L15 10" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" />
      <path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z" />
      <path d="M5 15l.7 1.6L7.3 17l-1.6.7L5 19.3l-.7-1.6L2.7 17l1.6-.7L5 15z" />
    </svg>
  );
}