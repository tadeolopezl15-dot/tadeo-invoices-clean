"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLang } from "@/components/LanguageProvider";

type PlanKey = "starter" | "pro" | "business";

export default function PricingPage() {
  const { lang } = useLang();
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
  const [error, setError] = useState("");

  const t = useMemo(
    () =>
      lang === "es"
        ? {
            badge: "Membresías",
            title: "Planes para crecer con una imagen profesional",
            subtitle:
              "Elige el plan ideal para tu negocio. Cobra membresías en tu cuenta de Stripe y administra facturas, clientes y pagos desde una sola plataforma.",
            monthly: "mensual",
            backHome: "Inicio",
            login: "Login",
            signup: "Empezar",
            mostPopular: "Más popular",
            choosePlan: "Elegir plan",
            processing: "Procesando...",
            includes: "Incluye",
            secureStripe: "Pago seguro con Stripe",
            faqTitle: "Preguntas frecuentes",
            faq1q: "¿El pago de las membresías entra a mi cuenta?",
            faq1a:
              "Sí. Si configuraste tus claves de Stripe en Vercel, las suscripciones se crean en tu propia cuenta.",
            faq2q: "¿Puedo cambiar de plan después?",
            faq2a:
              "Sí. Puedes actualizar o cancelar tu membresía más adelante desde tu panel.",
            faq3q: "¿Funciona en móvil y en computadora?",
            faq3a:
              "Sí. La plataforma está ajustada para usarse bien en ambos.",
            errorDefault: "No se pudo iniciar el checkout.",
            plans: {
              starter: {
                name: "Starter",
                price: "$12",
                description:
                  "Ideal para comenzar con facturación profesional.",
                features: [
                  "Facturas ilimitadas",
                  "Página pública de factura",
                  "Clientes básicos",
                  "Diseño responsive",
                  "Soporte por email",
                ],
              },
              pro: {
                name: "Pro",
                price: "$29",
                description:
                  "Para negocios que quieren verse premium y cobrar mejor.",
                features: [
                  "Todo en Starter",
                  "Subida de logo",
                  "Gestión avanzada de clientes",
                  "Pagos con Stripe",
                  "Mejor experiencia visual",
                ],
              },
              business: {
                name: "Business",
                price: "$59",
                description:
                  "Pensado para operaciones más completas y crecimiento.",
                features: [
                  "Todo en Pro",
                  "Funciones avanzadas",
                  "Mayor personalización",
                  "Prioridad en soporte",
                  "Preparado para escalar",
                ],
              },
            },
          }
        : {
            badge: "Memberships",
            title: "Plans to grow with a professional image",
            subtitle:
              "Choose the right plan for your business. Charge memberships to your Stripe account and manage invoices, clients, and payments from one platform.",
            monthly: "monthly",
            backHome: "Home",
            login: "Login",
            signup: "Get started",
            mostPopular: "Most popular",
            choosePlan: "Choose plan",
            processing: "Processing...",
            includes: "Includes",
            secureStripe: "Secure payment with Stripe",
            faqTitle: "Frequently asked questions",
            faq1q: "Do membership payments go to my account?",
            faq1a:
              "Yes. If your Stripe keys are configured in Vercel, subscriptions are created in your own account.",
            faq2q: "Can I change plans later?",
            faq2a:
              "Yes. You can upgrade or cancel your membership later from your dashboard.",
            faq3q: "Does it work on mobile and desktop?",
            faq3a:
              "Yes. The platform is adjusted to work well on both.",
            errorDefault: "Could not start checkout.",
            plans: {
              starter: {
                name: "Starter",
                price: "$12",
                description: "Perfect to start with professional invoicing.",
                features: [
                  "Unlimited invoices",
                  "Public invoice page",
                  "Basic clients",
                  "Responsive design",
                  "Email support",
                ],
              },
              pro: {
                name: "Pro",
                price: "$29",
                description:
                  "For businesses that want a premium image and better payments.",
                features: [
                  "Everything in Starter",
                  "Logo upload",
                  "Advanced client management",
                  "Stripe payments",
                  "Better visual experience",
                ],
              },
              business: {
                name: "Business",
                price: "$59",
                description:
                  "Built for more complete operations and growth.",
                features: [
                  "Everything in Pro",
                  "Advanced features",
                  "More customization",
                  "Priority support",
                  "Ready to scale",
                ],
              },
            },
          },
    [lang]
  );

  async function goToCheckout(plan: PlanKey) {
    try {
      setError("");
      setLoadingPlan(plan);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || t.errorDefault);
      }

      window.location.href = data.url;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t.errorDefault;
      setError(message);
    } finally {
      setLoadingPlan(null);
    }
  }

  const cards: Array<{ key: PlanKey; featured?: boolean }> = [
    { key: "starter" },
    { key: "pro", featured: true },
    { key: "business" },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_45%,_#ffffff_100%)] text-slate-900">
      <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-12 lg:px-8">
        <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {t.backHome}
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {t.login}
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {t.signup}
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-4xl text-center">
          <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
            {t.badge}
          </p>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            {t.title}
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
            {t.subtitle}
          </p>
        </div>

        {error ? (
          <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {cards.map(({ key, featured }) => {
            const plan = t.plans[key];
            const isLoading = loadingPlan === key;

            return (
              <div
                key={key}
                className={`relative flex h-full flex-col rounded-[30px] border bg-white p-5 shadow-sm transition md:p-6 ${
                  featured
                    ? "border-slate-900 shadow-[0_18px_60px_rgba(15,23,42,0.10)]"
                    : "border-slate-200"
                }`}
              >
                {featured ? (
                  <div className="absolute -top-3 left-5 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                    {t.mostPopular}
                  </div>
                ) : null}

                <div className="mt-2">
                  <h2 className="text-2xl font-bold text-slate-950">
                    {plan.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {plan.description}
                  </p>
                </div>

                <div className="mt-6">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold tracking-tight text-slate-950">
                      {plan.price}
                    </span>
                    <span className="pb-1 text-sm text-slate-500">
                      / {t.monthly}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => goToCheckout(key)}
                  disabled={isLoading}
                  className={`mt-6 inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                    featured
                      ? "bg-slate-950 text-white hover:opacity-90"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {isLoading ? t.processing : t.choosePlan}
                </button>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {t.includes}
                  </p>

                  <ul className="mt-4 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-slate-700"
                      >
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="mt-5 text-xs font-medium text-slate-500">
                  {t.secureStripe}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-14 rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <h3 className="text-2xl font-bold text-slate-950">{t.faqTitle}</h3>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-950">{t.faq1q}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {t.faq1a}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-950">{t.faq2q}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {t.faq2a}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-950">{t.faq3q}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {t.faq3a}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}