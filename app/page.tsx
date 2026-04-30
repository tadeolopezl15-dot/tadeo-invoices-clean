import AppHeader from "@/components/AppHeader";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="ui-page">
      <AppHeader />

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 lg:px-8">
        <div className="ui-card p-8 md:p-12">
          <div className="ui-badge mb-4">
            Professional invoicing with premium design
          </div>

          <h1 className="text-4xl font-extrabold leading-tight text-slate-950 md:text-6xl">
            Create, send and collect invoices{" "}
            <span className="bg-gradient-to-r from-blue-600 to-slate-950 bg-clip-text text-transparent">
              like a pro
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            Tadeo Invoices lets you generate professional invoices, manage
            clients, and collect payments online with a modern SaaS experience.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="btn btn-primary">
              Get started
            </Link>

            <Link href="/pricing" className="btn btn-secondary">
              View pricing
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="ui-card p-6">
            <h3 className="text-lg font-black text-slate-950">
              ⚡ Fast
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Create invoices in seconds from any device.
            </p>
          </div>

          <div className="ui-card p-6">
            <h3 className="text-lg font-black text-slate-950">
              💎 Premium
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Clean, elegant design ready for real clients.
            </p>
          </div>

          <div className="ui-card p-6">
            <h3 className="text-lg font-black text-slate-950">
              📱 Flexible
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Works perfectly on mobile, tablet and desktop.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-slate-950 p-10 text-center text-white shadow-xl">
          <h2 className="text-3xl font-black">
            Start invoicing today
          </h2>

          <p className="mt-3 text-sm text-blue-100">
            Join professionals using Tadeo Invoices to run their business.
          </p>

          <Link
            href="/signup"
            className="mt-6 inline-block rounded-2xl bg-white px-6 py-3 text-sm font-black text-slate-950 shadow-md hover:scale-[1.02] transition"
          >
            Create account
          </Link>
        </div>
      </section>
    </main>
  );
}