"use client";

import { useState } from "react";
import { useLang } from "@/components/LanguageProvider";

type PlanKey = "starter" | "pro" | "business";

export default function PricingPage() {
  const { lang } = useLang();
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);

  const text =
    lang === "en"
      ? {
          badge: "Pricing",
          title: "Choose your membership",
          subtitle:
            "Start simple and upgrade when your business grows.",
          starter: "Starter",
          pro: "Pro",
          business: "Business",
          starterDesc: "For new freelancers and small businesses.",
          proDesc: "For growing businesses that need more control.",
          businessDesc: "For serious teams and high-volume billing.",
          month: "/month",
          buy: "Choose plan",
          features: "Includes",
          starterFeatures: [
            "Create invoices",
            "Public invoice links",
            "Basic dashboard",
          ],
          proFeatures: [
            "Everything in Starter",
            "Premium invoicing workflow",
            "Email sending",
            "Company branding",
          ],
          businessFeatures: [
            "Everything in Pro",
            "Highest priority support",
            "Advanced growth-ready setup",
            "Best plan for scaling",
          ],
          error: "Could not start checkout",
        }
      : {
          badge: "Precios",
          title: "Elige tu membresía",
          subtitle:
            "Empieza simple y sube de nivel cuando tu negocio crezca.",
          starter: "Starter",
          pro: "Pro",
          business: "Business",
          starterDesc: "Para freelancers nuevos y pequeños negocios.",
          proDesc: "Para negocios en crecimiento que necesitan más control.",
          businessDesc: "Para equipos serios y alto volumen de facturación.",
          month: "/mes",
          buy: "Elegir plan",
          features: "Incluye",
          starterFeatures: [
            "Crear facturas",
            "Links públicos de factura",
            "Dashboard básico",
          ],
          proFeatures: [
            "Todo lo de Starter",
            "Flujo premium de facturación",
            "Envío por email",
            "Branding de empresa",
          ],
          businessFeatures: [
            "Todo lo de Pro",
            "Soporte prioritario",
            "Base avanzada para crecer",
            "Mejor plan para escalar",
          ],
          error: "No se pudo iniciar checkout",
        };

  async function startCheckout(plan: PlanKey) {
    try {
      setLoadingPlan(plan);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data?.error || text.error);
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("PRICING_CHECKOUT_ERROR", error);
      alert(error instanceof Error ? error.message : text.error);
    } finally {
      setLoadingPlan(null);
    }
  }

  const cards = [
    {
      key: "starter" as const,
      title: text.starter,
      price: "$12",
      desc: text.starterDesc,
      features: text.starterFeatures,
    },
    {
      key: "pro" as const,
      title: text.pro,
      price: "$29",
      desc: text.proDesc,
      features: text.proFeatures,
    },
    {
      key: "business" as const,
      title: text.business,
      price: "$59",
      desc: text.businessDesc,
      features: text.businessFeatures,
    },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_45%,_#ffffff_100%)] px-4 py-10 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
            {text.badge}
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            {text.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
            {text.subtitle}
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.key}
              className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-slate-950">{card.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{card.desc}</p>

              <div className="mt-6">
                <span className="text-4xl font-extrabold text-slate-950">
                  {card.price}
                </span>
                <span className="ml-2 text-sm text-slate-500">{text.month}</span>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold text-slate-700">
                  {text.features}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {card.features.map((feature) => (
                    <li key={feature}>• {feature}</li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => startCheckout(card.key)}
                disabled={loadingPlan === card.key}
                className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingPlan === card.key ? "..." : text.buy}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}