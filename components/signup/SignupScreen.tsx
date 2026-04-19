"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import PasswordField from "@/components/PasswordField";

type SignupScreenProps = {
  action: (formData: FormData) => void | Promise<void>;
  errorMessage?: string;
  successMessage?: string;
};

type Lang = "es" | "en";

const copy = {
  es: {
    badge: "Registro profesional",
    heroEyebrow: "crea tu cuenta",
    heroTitleA: "Empieza con una plataforma",
    heroTitleB: "moderna, elegante y lista para crecer",
    heroDesc:
      "Crea tu cuenta, configura tu negocio y empieza a administrar clientes, facturas y documentos con una experiencia visual de nivel SaaS.",

    feature1Title: "Cuenta profesional",
    feature1Desc:
      "Acceso organizado para administrar negocio, clientes y facturación.",
    feature2Title: "Perfil personalizable",
    feature2Desc:
      "Guarda tu nombre, empresa y base de configuración desde el inicio.",
    feature3Title: "Escalable",
    feature3Desc:
      "Preparado para membresías, branding, PDF pro y panel más avanzado.",

    secureAccess: "registro seguro",
    signupTitle: "Crear cuenta",
    signupDesc:
      "Regístrate para acceder a tu panel y comenzar a gestionar tu negocio.",
    fullName: "Nombre completo",
    fullNamePlaceholder: "Tu nombre",
    companyName: "Empresa",
    companyNamePlaceholder: "Nombre de tu empresa",
    email: "Correo electrónico",
    emailPlaceholder: "tu@email.com",
    password: "Contraseña",
    confirmPassword: "Confirmar contraseña",
    remember: "Acepto continuar con mi registro",
    safe: "Seguro",
    submit: "Crear cuenta",
    submitting: "Creando cuenta...",
    hasAccount: "¿Ya tienes cuenta?",
    login: "Iniciar sesión",
    businessReady: "Negocio listo",
    clients: "Clientes",
    invoices: "Facturas",
    setup: "Config.",
  },
  en: {
    badge: "Professional signup",
    heroEyebrow: "create your account",
    heroTitleA: "Start with a platform",
    heroTitleB: "modern, elegant, and ready to grow",
    heroDesc:
      "Create your account, set up your business, and start managing clients, invoices, and documents with a SaaS-level visual experience.",

    feature1Title: "Professional account",
    feature1Desc:
      "Structured access to manage your business, clients, and invoicing.",
    feature2Title: "Custom profile",
    feature2Desc:
      "Save your name, company, and configuration foundation from day one.",
    feature3Title: "Scalable",
    feature3Desc:
      "Ready for memberships, branding, pro PDFs, and a more advanced dashboard.",

    secureAccess: "secure signup",
    signupTitle: "Create account",
    signupDesc:
      "Sign up to access your dashboard and start managing your business.",
    fullName: "Full name",
    fullNamePlaceholder: "Your name",
    companyName: "Company",
    companyNamePlaceholder: "Your company name",
    email: "Email address",
    emailPlaceholder: "you@email.com",
    password: "Password",
    confirmPassword: "Confirm password",
    remember: "I agree to continue with my registration",
    safe: "Secure",
    submit: "Create account",
    submitting: "Creating account...",
    hasAccount: "Already have an account?",
    login: "Sign in",
    businessReady: "Business ready",
    clients: "Clients",
    invoices: "Invoices",
    setup: "Setup",
  },
} as const;

export default function SignupScreen({
  action,
  errorMessage = "",
  successMessage = "",
}: SignupScreenProps) {
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
                  icon={<UserPlusIcon />}
                  title={t.feature1Title}
                  desc={t.feature1Desc}
                />
                <FeatureCard
                  icon={<BuildingIcon />}
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
                <MiniStat label={t.businessReady} value="100%" />
                <MiniStat label={t.clients} value="+120" />
                <MiniStat label={t.invoices} value="+4.8k" />
              </div>

              <div className="mt-5 rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white/65">
                    {t.setup}
                  </p>
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/70">
                    + Ready
                  </p>
                </div>

                <div className="mt-5 flex h-28 items-end gap-2">
                  <Bar h="h-10" />
                  <Bar h="h-12" />
                  <Bar h="h-16" />
                  <Bar h="h-20" />
                  <Bar h="h-24" />
                  <Bar h="h-28" />
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
                      {t.signupTitle}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {t.signupDesc}
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
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label={t.fullName}
                      id="full_name"
                      name="full_name"
                      type="text"
                      placeholder={t.fullNamePlaceholder}
                      icon={<UserIcon />}
                    />
                    <Field
                      label={t.companyName}
                      id="company_name"
                      name="company_name"
                      type="text"
                      placeholder={t.companyNamePlaceholder}
                      icon={<BuildingIcon />}
                    />
                  </div>

                  <Field
                    label={t.email}
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t.emailPlaceholder}
                    icon={<MailIcon />}
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label
                        htmlFor="password"
                        className="text-sm font-medium text-slate-700"
                      >
                        {t.password}
                      </label>
                      <PasswordField />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="confirm_password"
                        className="text-sm font-medium text-slate-700"
                      >
                        {t.confirmPassword}
                      </label>

                      <div className="group relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-slate-700">
                          <LockIcon />
                        </span>
                        <input
                          id="confirm_password"
                          name="confirm_password"
                          type="password"
                          required
                          placeholder="••••••••"
                          autoComplete="new-password"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-[15px] outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        required
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
                      />
                      {t.remember}
                    </label>

                    <div className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.20em] text-emerald-700">
                      {t.safe}
                    </div>
                  </div>

                  <SubmitButton submitText={t.submit} loadingText={t.submitting} />
                </form>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <QuickInfo label={t.clients} value="+120" />
                  <QuickInfo label={t.invoices} value="+4.8k" />
                  <QuickInfo label={t.setup} value="Pro" />
                </div>

                <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-center text-sm text-slate-600">
                    {t.hasAccount}{" "}
                    <Link
                      href="/login"
                      className="font-semibold text-slate-950 transition hover:text-slate-700"
                    >
                      {t.login}
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

function Field({
  label,
  id,
  name,
  type,
  placeholder,
  icon,
}: {
  label: string;
  id: string;
  name: string;
  type: string;
  placeholder: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="group relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-slate-700">
          {icon}
        </span>

        <input
          id={id}
          name={name}
          type={type}
          required={name !== "company_name"}
          placeholder={placeholder}
          autoComplete={name}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-[15px] outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-200"
        />
      </div>
    </div>
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

function UserIcon() {
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
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

function UserPlusIcon() {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="4" />
      <path d="M19 8v6" />
      <path d="M22 11h-6" />
    </svg>
  );
}

function BuildingIcon() {
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
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 10h.01" />
      <path d="M9 14h.01" />
      <path d="M15 10h.01" />
      <path d="M15 14h.01" />
      <path d="M11 21v-4h2v4" />
    </svg>
  );
}

function LockIcon() {
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
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
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