"use client";

import AppHeader from "@/components/AppHeader";

type Plan = "starter" | "pro" | "business";

const plans: {
  id: Plan;
  name: string;
  price: string;
  description: string;
  features: string[];
}[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$12/mo",
    description: "Perfecto para comenzar.",
    features: ["Hasta 5 facturas", "PDF básico", "Clientes ilimitados"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29/mo",
    description: "Para negocios en crecimiento.",
    features: ["Hasta 50 facturas", "PDF premium", "Pagos con Stripe"],
  },
  {
    id: "business",
    name: "Business",
    price: "$59/mo",
    description: "Para equipos y uso avanzado.",
    features: ["Facturas ilimitadas", "Branding avanzado", "Soporte premium"],
  },
];

export default function PricingPage() {
  async function subscribe(plan: Plan) {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Error al abrir Stripe.");
      return;
    }

    window.location.href = data.url;
  }

  return (
    <main className="ui-page">
      <AppHeader />

      <section className="ui-shell">
        <div className="text-center">
          <div className="ui-badge mx-auto">Membresías</div>

          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
            Elige tu plan
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600 md:text-xl">
            Activa tu cuenta y comienza a crear facturas profesionales con pagos
            integrados.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.id} className="ui-card p-6">
              <h2 className="text-2xl font-black text-slate-950">
                {plan.name}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {plan.description}
              </p>

              <div className="mt-6 text-4xl font-black text-slate-950">
                {plan.price}
              </div>

              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                {plan.features.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>

              <button
                onClick={() => subscribe(plan.id)}
                className="btn btn-primary mt-8 w-full"
              >
                Elegir {plan.name}
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}