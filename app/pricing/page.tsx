"use client";

import { useState } from "react";
import AppHeader from "@/components/AppHeader";

type PlanKey = "starter" | "pro" | "business";

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);

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
        throw new Error(data?.error || "No se pudo iniciar checkout");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "No se pudo iniciar checkout");
    } finally {
      setLoadingPlan(null);
    }
  }

  const cards = [
    {
      key: "starter" as const,
      title: "Starter",
      price: "$12",
      desc: "Perfect to start with professional invoicing.",
      features: ["Create invoices", "Basic dashboard", "Public invoice links"],
    },
    {
      key: "pro" as const,
      title: "Pro",
      price: "$29",
      desc: "For growing businesses that need more control.",
      features: ["Everything in Starter", "Email sending", "Company branding"],
    },
    {
      key: "business" as const,
      title: "Business",
      price: "$59",
      desc: "For teams and serious growth.",
      features: ["Everything in Pro", "Priority support", "Best plan to scale"],
    },
  ];

  return (
    <main className="ui-page">
      <AppHeader />

      <div className="ui-shell">
        <div className="text-center">
          <p className="ui-badge">Memberships</p>
          <h1 className="mt-5 text-5xl font-extrabold tracking-tight text-slate-950 md:text-7xl">
            Plans to grow with a professional image
          </h1>
          <p className="mx-auto mt-5 max-w-4xl text-base leading-8 text-slate-600 md:text-xl">
            Choose the right plan for your business. Charge memberships to your Stripe
            account and manage invoices, clients, and payments from one platform.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.key} className="ui-card p-6">
              <h2 className="text-3xl font-bold text-slate-950">{card.title}</h2>
              <p className="mt-3 text-base text-slate-600">{card.desc}</p>

              <div className="mt-8">
                <span className="text-5xl font-extrabold text-blue-600">{card.price}</span>
                <span className="ml-2 text-xl text-slate-500">/ monthly</span>
              </div>

              <button
                type="button"
                onClick={() => startCheckout(card.key)}
                disabled={loadingPlan === card.key}
                className="btn btn-primary mt-8 w-full"
              >
                {loadingPlan === card.key ? "..." : "Choose plan"}
              </button>

              <div className="ui-panel-soft mt-8">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-600">
                  Includes
                </p>
                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                  {card.features.map((feature) => (
                    <li key={feature}>✓ {feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}