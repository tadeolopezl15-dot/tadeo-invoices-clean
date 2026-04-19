"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import PasswordField from "@/components/PasswordField";

type LoginScreenProps = {
  action: (formData: FormData) => void | Promise<void>;
  errorMessage?: string;
};

type Lang = "es" | "en";

const copy = {
  es: {
    badge: "Plataforma profesional de facturación",
    heroEyebrow: "acceso premium",
    heroTitleA: "Controla tu negocio con una experiencia",
    heroTitleB: "más moderna, clara y profesional",
    heroDesc:
      "Facturación, clientes, branding, métricas y documentos en una interfaz de nivel SaaS, diseñada para verse elegante y sentirse sólida desde el primer acceso.",

    feature1Title: "Multiusuario",
    feature1Desc:
      "Cada miembro entra con su cuenta, su negocio y su propia configuración.",
    feature2Title: "Acceso seguro",
    feature2Desc:
      "Inicio de sesión protegido, navegación limpia y experiencia más confiable.",
    feature3Title: "Branding Pro",
    feature3Desc:
      "Facturas y panel con imagen más seria, premium y lista para clientes.",

    overview: "rendimiento general",
    overviewDesc: "Métricas rápidas del sistema con estilo más visual.",
    online: "En línea",
    income: "Ingresos",
    paid: "Pagadas",
    clients: "Clientes",
    monthlyFlow: "Flujo mensual",
    automation: "Automatización",
    fastInvoices: "Facturas más rápidas",
    fastInvoicesDesc:
      "Totales, estados y flujo visual mejor organizados para ahorrar tiempo.",
    presentation: "Presentación",
    businessImage: "Imagen empresarial",
    businessImageDesc:
      "Una interfaz más seria eleva la percepción de tu plataforma y de tu marca.",
    activity: "actividad",
    item1: "Factura enviada",
    item2: "Pago confirmado",
    item3: "Nuevo cliente agregado",
    ago3: "Hace 3 min",
    ago12: "Hace 12 min",
    ago28: "Hace 28 min",

    secureAccess: "acceso seguro",
    loginTitle: "Iniciar sesión",
    loginDesc:
      "Accede a tu panel, administra facturas y controla tu negocio desde una interfaz más profesional.",
    email: "Correo electrónico",
    emailPlaceholder: "tu@email.com",
    password: "Contraseña",
    forgotPassword: "¿Olvidaste tu contraseña?",
    remember: "Recordarme",
    safe: "Seguro",
    submit: "Entrar al panel",
    submitting: "Entrando...",
    noAccount: "¿No tienes cuenta?",
    createAccount: "Crear cuenta",

    statClients: "Clientes",
    statInvoices: "Facturas",
    statBrand: "Marca",

    mobile1Title: "PDF Pro",
    mobile1Desc: "Facturas elegantes y listas para cliente.",
    mobile2Title: "Branding",
    mobile2Desc: "Cada usuario con su identidad visual.",
  },
  en: {
    badge: "Professional invoicing platform",
    heroEyebrow: "premium access",
    heroTitleA: "Run your business with a",
    heroTitleB: "more modern, clear, and professional experience",
    heroDesc:
      "Invoices, clients, branding, metrics, and documents in a SaaS-level interface designed to look elegant and feel solid from the very first login.",

    feature1Title: "Multi-user",
    feature1Desc:
      "Each member signs in with their own account, business, and configuration.",
    feature2Title: "Secure access",
    feature2Desc:
      "Protected sign-in, cleaner navigation, and a more reliable experience.",
    feature3Title: "Pro branding",
    feature3Desc:
      "Invoices and dashboard with a more premium, serious, client-ready image.",

    overview: "overall performance",
    overviewDesc: "Quick system metrics with a stronger visual style.",
    online: "Online",
    income: "Revenue",
    paid: "Paid",
    clients: "Clients",
    monthlyFlow: "Monthly flow",
    automation: "Automation",
    fastInvoices: "Faster invoices",
    fastInvoicesDesc:
      "Totals, statuses, and visual flow organized more clearly to save time.",
    presentation: "Presentation",
    businessImage: "Business image",
    businessImageDesc:
      "A more polished interface improves the perception of your platform and brand.",
    activity: "activity",
    item1: "Invoice sent",
    item2: "Payment confirmed",
    item3: "New client added",
    ago3: "3 min ago",
    ago12: "12 min ago",
    ago28: "28 min ago",

    secureAccess: "secure access",
    loginTitle: "Sign in",
    loginDesc:
      "Access your dashboard, manage invoices, and run your business from a more professional interface.",
    email: "Email address",
    emailPlaceholder: "you@email.com",
    password: "Password",
    forgotPassword: "Forgot your password?",
    remember: "Remember me",
    safe: "Secure",
    submit: "Enter dashboard",
    submitting: "Signing in...",
    noAccount: "Don’t have an account?",
    createAccount: "Create account",

    statClients: "Clients",
    statInvoices: "Invoices",
    statBrand: "Brand",

    mobile1Title: "Pro PDF",
    mobile1Desc: "Elegant invoices ready for clients.",
    mobile2Title: "Branding",
    mobile2Desc: "Each user with their own visual identity.",
  },
} as const;

export default function LoginScreen({
  action,
  errorMessage = "",
}: LoginScreenProps) {
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

      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1700px] lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden lg:flex">
          <div className="flex w-full flex-col justify-between px-10 py-10 xl:px-16 xl:py-14">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
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
                  icon={<UsersIcon />}
                  title={t.feature1Title}
                  desc={t.feature1Desc}
                />
                <FeatureCard
                  icon={<ShieldIcon />}
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
              <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.26em] text-white/35">
                        {t.overview}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-white">
                        Business Overview
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-white/50">
                        {t.overviewDesc}
                      </p>
                    </div>

                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                      {t.online}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <MiniStat label={t.income} value="$24.8k" />
                    <MiniStat label={t.paid} value="94%" />
                    <MiniStat label={t.clients} value="136" />
                  </div>

                  <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white/65">
                        {t.monthlyFlow}
                      </p>
                      <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/70">
                        +18.4%
                      </p>
                    </div>

                    <div className="mt-5 flex h-32 items-end gap-2">
                      <Bar h="h-9" />
                      <Bar h="h-16" />
                      <Bar h="h-12" />
                      <Bar h="h-20" />
                      <Bar h="h-14" />
                      <Bar h="h-28" />
                      <Bar h="h-24" />
                      <Bar h="h-32" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <PanelCard
                    eyebrow={t.automation}
                    title={t.fastInvoices}
                    text={t.fastInvoicesDesc}
                    accent="from-cyan-500/20 to-blue-500/10"
                  />

                  <PanelCard
                    eyebrow={t.presentation}
                    title={t.businessImage}
                    text={t.businessImageDesc}
                    accent="from-violet-500/20 to-fuchsia-500/10"
                  />

                  <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/35">
                      {t.activity}
                    </p>

                    <div className="mt-4 space-y-3">
                      <ActivityItem
                        title={t.item1}
                        meta={t.ago3}
                        dot="bg-cyan-400"
                      />
                      <ActivityItem
                        title={t.item2}
                        meta={t.ago12}
                        dot="bg-emerald-400"
                      />
                      <ActivityItem
                        title={t.item3}
                        meta={t.ago28}
                        dot="bg-violet-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center px-5 py-10 sm:px-8 lg:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.14),transparent_30%)]" />

          <div className="relative w-full max-w-md">
            <div className="absolute -inset-8 rounded-[40px] bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-violet-500/10 blur-3xl" />

            <div className="relative rounded-[34px] border border-white/10 bg-white/[0.07] p-2 shadow-[0_35px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
              <div className="rounded-[30px] bg-white px-6 py-7 text-slate-900 sm:px-8 sm:py-8">
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      {t.secureAccess}
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2rem]">
                      {t.loginTitle}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {t.loginDesc}
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

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <label
                        htmlFor="password"
                        className="text-sm font-medium text-slate-700"
                      >
                        {t.password}
                      </label>

                      <Link
                        href="/forgot-password"
                        className="text-xs font-semibold text-slate-500 transition hover:text-slate-900"
                      >
                        {t.forgotPassword}
                      </Link>
                    </div>

                    <PasswordField />
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        name="remember"
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
                  <QuickInfo label={t.statClients} value="+120" />
                  <QuickInfo label={t.statInvoices} value="+4.8k" />
                  <QuickInfo label={t.statBrand} value="Pro" />
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

            <div className="mt-4 grid grid-cols-2 gap-3 lg:hidden">
              <MobileFeature
                title={t.mobile1Title}
                desc={t.mobile1Desc}
              />
              <MobileFeature
                title={t.mobile2Title}
                desc={t.mobile2Desc}
              />
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

function PanelCard({
  eyebrow,
  title,
  text,
  accent,
}: {
  eyebrow: string;
  title: string;
  text: string;
  accent: string;
}) {
  return (
    <div
      className={`rounded-[26px] border border-white/10 bg-gradient-to-br ${accent} p-5`}
    >
      <p className="text-xs uppercase tracking-[0.22em] text-white/40">
        {eyebrow}
      </p>
      <h4 className="mt-2 text-lg font-semibold text-white">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-white/58">{text}</p>
    </div>
  );
}

function ActivityItem({
  title,
  meta,
  dot,
}: {
  title: string;
  meta: string;
  dot: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3">
      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white/85">{title}</p>
        <p className="text-xs text-white/40">{meta}</p>
      </div>
    </div>
  );
}

function MobileFeature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-xs leading-5 text-white/60">{desc}</p>
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

function UsersIcon() {
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
      <path d="M20 8v6" />
      <path d="M23 11h-6" />
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