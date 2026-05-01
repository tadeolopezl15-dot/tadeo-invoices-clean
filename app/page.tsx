import AppHeader from "@/components/AppHeader";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="ui-page">
      <AppHeader />

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
        <div className="ui-card p-8 md:p-12">
          <div className="ui-badge mb-4">
            Modern invoicing platform
          </div>

          <h1 className="text-4xl font-extrabold leading-tight text-slate-950 md:text-6xl">
            Create, send and get paid{" "}
            <span className="bg-gradient-to-r from-blue-600 to-slate-950 bg-clip-text text-transparent">
              faster than ever
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-slate-600">
            Tadeo Invoices helps you manage clients, generate professional
            invoices, and collect payments online with a premium SaaS
            experience.
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
              ⚡ Fast invoicing
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Create invoices in seconds and send them instantly.
            </p>
          </div>

          <div className="ui-card p-6">
            <h3 className="text-lg font-black text-slate-950">
              💳 Online payments
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Accept payments directly from your clients securely.
            </p>
          </div>

          <div className="ui-card p-6">
            <h3 className="text-lg font-black text-slate-950">
              📊 Business control
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Track invoices, clients and revenue in one place.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-slate-950 p-10 text-center text-white shadow-xl">
          <h2 className="text-3xl font-black">
            Start your invoicing system today
          </h2>

          <p className="mt-3 text-sm text-blue-100">
            Join professionals already using Tadeo Invoices.
          </p>

          <Link
            href="/signup"
            className="mt-6 inline-block rounded-2xl bg-white px-6 py-3 text-sm font-black text-slate-950 shadow-md transition hover:scale-[1.02]"
          >
            Create account
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Tadeo Invoices. All rights reserved.
      </footer>
    </main>
  );
}