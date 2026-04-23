import Link from "next/link";
import AppHeader from "@/components/AppHeader";

export default function HomePage() {
  return (
    <main className="ui-page">
      <AppHeader />

      <div className="ui-shell">
        {/* HERO */}
        <section className="ui-card p-6 md:p-10">
          <div className="ui-badge">
            PROFESSIONAL INVOICING WITH A PREMIUM IMAGE
          </div>

          <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-slate-950 md:text-7xl leading-tight">
            Create, share, and collect invoices with a professional design on
            mobile and desktop.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Tadeo Invoices lets you generate clean invoices, manage clients,
            share public links, and collect payments with a modern SaaS-style
            experience.
          </p>

          {/* 🔥 BOTONES ARREGLADOS */}
          <div className="ui-actions mt-8">
            <Link href="/signup" className="btn btn-primary">
              Get started
            </Link>

            <Link href="/pricing" className="btn btn-secondary">
              See pricing
            </Link>
          </div>
        </section>

        {/* FEATURES */}
        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="ui-panel">
            <h3 className="text-xl font-bold text-slate-950">+Fast</h3>
            <p className="mt-3 text-slate-600">
              Create invoices in minutes from any device.
            </p>
          </div>

          <div className="ui-panel">
            <h3 className="text-xl font-bold text-slate-950">+Premium</h3>
            <p className="mt-3 text-slate-600">
              Clean, elegant design ready for real clients.
            </p>
          </div>

          <div className="ui-panel">
            <h3 className="text-xl font-bold text-slate-950">+Flexible</h3>
            <p className="mt-3 text-slate-600">
              Works well on mobile, tablet, laptop, and desktop.
            </p>
          </div>
        </section>

        {/* DEMO CARD */}
        <section className="mt-10 ui-card p-6 md:p-10">
          <div className="grid gap-6 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-950">
                Everything you need to manage invoices
              </h2>

              <p className="mt-4 text-slate-600 leading-7">
                From creating invoices to sending emails and receiving payments,
                everything is connected in one powerful platform.
              </p>

              <div className="mt-6 ui-actions">
                <Link href="/dashboard" className="btn btn-primary">
                  Go to dashboard
                </Link>

                <Link href="/invoice" className="btn btn-secondary">
                  View invoices
                </Link>
              </div>
            </div>

            <div className="ui-panel-soft">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice #</span>
                  <span className="font-bold">INV-1001</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Client</span>
                  <span className="font-bold">John Doe</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="ui-pill ui-pill-paid">paid</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total</span>
                  <span className="font-bold text-blue-600">$1,200</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="mt-10 text-center ui-card p-8">
          <h2 className="text-3xl font-extrabold text-slate-950">
            Ready to upgrade your invoicing?
          </h2>

          <p className="mt-4 text-slate-600">
            Start using Tadeo Invoices today and look like a real business.
          </p>

          <div className="mt-6 ui-actions justify-center">
            <Link href="/signup" className="btn btn-primary">
              Create account
            </Link>

            <Link href="/pricing" className="btn btn-secondary">
              View plans
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}