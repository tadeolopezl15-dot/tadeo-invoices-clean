"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Lang = "es" | "en";

type DashboardScreenProps = {
  user: {
    email: string;
    fullName: string;
    companyName: string;
    role: string;
  };
};

const copy = {
  es: {
    badge: "Panel profesional",
    welcome: "bienvenido de nuevo",
    heroTitleA: "Controla tu negocio desde un",
    heroTitleB: "dashboard moderno, claro y premium",
    heroDesc:
      "Consulta métricas, clientes, facturas, branding y accesos rápidos desde una experiencia visual más sólida y empresarial.",

    revenue: "Ingresos",
    invoices: "Facturas",
    clients: "Clientes",
    paidRate: "Pagadas",

    monthlyOverview: "Resumen mensual",
    monthlyGrowth: "Crecimiento",
    recentActivity: "Actividad reciente",
    performance: "Rendimiento",
    thisMonth: "Este mes",
    active: "Activo",

    quickActions: "Acciones rápidas",
    newInvoice: "Nueva factura",
    clientsBtn: "Clientes",
    settingsBtn: "Configuración",
    plansBtn: "Membresías",

    overview: "Resumen del negocio",
    overviewDesc:
      "Vista general de ingresos, facturación y rendimiento comercial.",
    invoicesPanel: "Facturación",
    invoicesPanelDesc:
      "Gestiona documentos, revisa estados y controla pagos pendientes.",
    brandPanel: "Marca y perfil",
    brandPanelDesc:
      "Mantén tu negocio con imagen profesional y configuración centralizada.",

    card1: "Factura enviada",
    card2: "Pago recibido",
    card3: "Cliente agregado",
    ago1: "Hace 5 min",
    ago2: "Hace 18 min",
    ago3: "Hace 42 min",

    business: "Empresa",
    email: "Correo",
    role: "Rol",
    account: "Cuenta",

    section1: "Estado general",
    section2: "Flujo financiero",
    section3: "Acceso rápido",

    subtitle1: "Vista central del sistema",
    subtitle2: "Control visual de tu operación",
    subtitle3: "Herramientas listas para usar",

    pro: "Pro",
  },
  en: {
    badge: "Professional dashboard",
    welcome: "welcome back",
    heroTitleA: "Run your business from a",
    heroTitleB: "modern, clear, and premium dashboard",
    heroDesc:
      "Review metrics, clients, invoices, branding, and quick actions from a more solid and business-grade visual experience.",

    revenue: "Revenue",
    invoices: "Invoices",
    clients: "Clients",
    paidRate: "Paid",

    monthlyOverview: "Monthly overview",
    monthlyGrowth: "Growth",
    recentActivity: "Recent activity",
    performance: "Performance",
    thisMonth: "This month",
    active: "Active",

    quickActions: "Quick actions",
    newInvoice: "New invoice",
    clientsBtn: "Clients",
    settingsBtn: "Settings",
    plansBtn: "Memberships",

    overview: "Business overview",
    overviewDesc:
      "General view of revenue, invoicing, and commercial performance.",
    invoicesPanel: "Invoicing",
    invoicesPanelDesc:
      "Manage documents, review statuses, and track pending payments.",
    brandPanel: "Brand & profile",
    brandPanelDesc:
      "Keep your business professional with centralized branding and settings.",

    card1: "Invoice sent",
    card2: "Payment received",
    card3: "Client added",
    ago1: "5 min ago",
    ago2: "18 min ago",
    ago3: "42 min ago",

    business: "Company",
    email: "Email",
    role: "Role",
    account: "Account",

    section1: "General status",
    section2: "Financial flow",
    section3: "Quick access",

    subtitle1: "Central system view",
    subtitle2: "Visual control of your operation",
    subtitle3: "Tools ready to use",

    pro: "Pro",
  },
} as const;

export default function DashboardScreen({ user }: DashboardScreenProps) {
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

      <div className="relative z-10 mx-auto max-w-[1700px] px-5 py-6 sm:px-8 lg:px-10 xl:px-14">
        <header className="rounded-[30px] border border-white/10 bg-white/[0.05] px-5 py-5 shadow-[0_25px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 backdrop-blur-xl">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                <span className="text-sm font-medium text-white/75">
                  {t.badge}
                </span>
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
                {t.welcome}
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl xl:text-5xl">
                {t.heroTitleA}
                <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  {t.heroTitleB}
                </span>
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60 sm:text-base">
                {t.heroDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[430px]">
              <InfoPill label={t.account} value={user.fullName} />
              <InfoPill label={t.business} value={user.companyName} />
              <InfoPill label={t.email} value={user.email} />
              <InfoPill label={t.role} value={user.role} />
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={t.revenue}
            value="$24,890"
            meta="+18.4%"
            icon={<DollarIcon />}
          />
          <StatCard
            label={t.invoices}
            value="128"
            meta="+12"
            icon={<InvoiceIcon />}
          />
          <StatCard
            label={t.clients}
            value="36"
            meta="+4"
            icon={<UsersIcon />}
          />
          <StatCard
            label={t.paidRate}
            value="94%"
            meta={t.active}
            icon={<CheckIcon />}
          />
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_25px_60px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/35">
                  {t.monthlyOverview}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {t.section2}
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  {t.subtitle2}
                </p>
              </div>

              <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                {t.thisMonth}
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_280px]">
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white/70">
                    {t.monthlyGrowth}
                  </p>
                  <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">
                    +18.4%
                  </p>
                </div>

                <div className="mt-5 flex h-40 items-end gap-2">
                  <Bar h="h-10" />
                  <Bar h="h-16" />
                  <Bar h="h-12" />
                  <Bar h="h-24" />
                  <Bar h="h-20" />
                  <Bar h="h-28" />
                  <Bar h="h-24" />
                  <Bar h="h-36" />
                  <Bar h="h-32" />
                  <Bar h="h-40" />
                </div>
              </div>

              <div className="space-y-4">
                <PanelCard
                  eyebrow={t.overview}
                  title={t.section1}
                  text={t.overviewDesc}
                  accent="from-cyan-500/20 to-blue-500/10"
                />
                <PanelCard
                  eyebrow={t.invoicesPanel}
                  title={t.pro}
                  text={t.invoicesPanelDesc}
                  accent="from-violet-500/20 to-fuchsia-500/10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_25px_60px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
              <p className="text-xs uppercase tracking-[0.22em] text-white/35">
                {t.quickActions}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">{t.section3}</h2>
              <p className="mt-2 text-sm leading-6 text-white/55">
                {t.subtitle3}
              </p>

              <div className="mt-5 grid gap-3">
                <QuickLink
                  href="/invoice/new"
                  title={t.newInvoice}
                  desc={t.invoicesPanelDesc}
                />
                <QuickLink
                  href="/clientes"
                  title={t.clientsBtn}
                  desc={t.overviewDesc}
                />
                <QuickLink
                  href="/configuracion"
                  title={t.settingsBtn}
                  desc={t.brandPanelDesc}
                />
                <QuickLink
                  href="/pricing"
                  title={t.plansBtn}
                  desc={t.invoicesPanelDesc}
                />
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_25px_60px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
              <p className="text-xs uppercase tracking-[0.22em] text-white/35">
                {t.recentActivity}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">{t.performance}</h2>

              <div className="mt-5 space-y-3">
                <ActivityItem
                  title={t.card1}
                  meta={t.ago1}
                  dot="bg-cyan-400"
                />
                <ActivityItem
                  title={t.card2}
                  meta={t.ago2}
                  dot="bg-emerald-400"
                />
                <ActivityItem
                  title={t.card3}
                  meta={t.ago3}
                  dot="bg-violet-400"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <FeatureBlock
            title={t.overview}
            text={t.overviewDesc}
            icon={<ChartIcon />}
          />
          <FeatureBlock
            title={t.invoicesPanel}
            text={t.invoicesPanelDesc}
            icon={<InvoiceIcon />}
          />
          <FeatureBlock
            title={t.brandPanel}
            text={t.brandPanelDesc}
            icon={<SparklesIcon />}
          />
        </section>
      </div>
    </main>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.20em] text-white/35">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium text-white/85">{value}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  meta,
  icon,
}: {
  label: string;
  value: string;
  meta: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/35">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
          <p className="mt-2 text-sm font-medium text-emerald-300">{meta}</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/15 to-violet-400/15 ring-1 ring-white/10 text-white/85">
          {icon}
        </div>
      </div>
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
      className={`rounded-[24px] border border-white/10 bg-gradient-to-br ${accent} p-4`}
    >
      <p className="text-xs uppercase tracking-[0.20em] text-white/40">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/58">{text}</p>
    </div>
  );
}

function QuickLink({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[22px] border border-white/10 bg-white/[0.04] p-4 transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.06]"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-white">{title}</p>
          <p className="mt-1 text-sm leading-6 text-white/55">{desc}</p>
        </div>
        <span className="text-white/50 transition group-hover:translate-x-0.5">
          →
        </span>
      </div>
    </Link>
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

function FeatureBlock({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/15 to-violet-400/15 ring-1 ring-white/10 text-white/85">
        {icon}
      </div>
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-white/55">{text}</p>
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

function DollarIcon() {
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
      <path d="M12 2v20" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function InvoiceIcon() {
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
      <path d="M7 3h8l4 4v14H7z" />
      <path d="M15 3v5h5" />
      <path d="M10 13h6" />
      <path d="M10 17h6" />
      <path d="M10 9h2" />
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

function CheckIcon() {
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
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.2 2.2 4.8-5.2" />
    </svg>
  );
}

function ChartIcon() {
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
      <path d="M4 19h16" />
      <path d="M7 16V9" />
      <path d="M12 16V5" />
      <path d="M17 16v-7" />
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