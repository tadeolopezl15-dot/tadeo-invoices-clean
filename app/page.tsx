import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Tadeo Invoices",
  description: "Crea, comparte y cobra facturas profesionalmente",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f7fbff_0%,#edf4fb_45%,#e7f0f8_100%)] text-slate-900">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <div className="flex items-center gap-4">
          <div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200">
            <Image
              src="/logo-tadeo-invoices.png"
              alt="Tadeo Invoices"
              width={96}
              height={96}
              className="h-20 w-20 object-cover md:h-24 md:w-24"
              priority
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
              Tadeo Invoices
            </h1>
            <p className="mt-1 text-lg text-slate-600">
              Billing platform for real businesses
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-10 md:flex">
          <Link
            href="/pricing"
            className="text-xl font-semibold text-slate-800 transition hover:text-blue-700"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-xl font-semibold text-slate-800 transition hover:text-blue-700"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-2xl bg-blue-700 px-8 py-4 text-xl font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.28)] transition hover:bg-blue-800"
          >
            Empezar
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-2 md:grid-cols-[1.05fr_0.95fr] md:px-10 md:pb-24">
        <div className="pt-4">
          <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-6 py-4 text-2xl font-semibold text-blue-800 shadow-sm md:text-3xl">
            <span className="mr-4 text-blue-700">•</span>
            Facturación profesional con marca propia
          </div>

          <h2 className="mt-8 max-w-3xl text-6xl font-semibold leading-[0.95] tracking-tight text-slate-950 md:text-8xl">
            Crea,
            <br />
            comparte
            <br />
            y cobra
            <br />
            facturas
            <br />
            con una
            <br />
            imagen
            <br />
            que sí se
            <br />
            ve
            <br />
            premium
          </h2>
        </div>

        <div className="relative flex items-end justify-center pt-10 md:pt-24">
          <div className="w-full max-w-[640px] rounded-[40px] bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.12)] ring-1 ring-slate-200">
            <div className="mb-5 flex gap-3 px-2">
              <span className="h-4 w-4 rounded-full bg-red-400" />
              <span className="h-4 w-4 rounded-full bg-amber-400" />
              <span className="h-4 w-4 rounded-full bg-emerald-400" />
            </div>

            <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-slate-50 p-6 md:p-8">
              <div className="mb-8 flex items-start justify-between gap-4">
                <div className="rounded-[24px] border border-blue-200 bg-blue-50 px-8 py-6">
                  <Image
                    src="/logo-tadeo-invoices.png"
                    alt="Logo de Tadeo Invoices"
                    width={220}
                    height={80}
                    className="h-12 w-auto object-contain"
                  />
                </div>

                <div className="rounded-[28px] bg-white px-6 py-5 shadow-md ring-1 ring-slate-200">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Payment Status
                  </p>
                  <p className="mt-3 text-5xl font-bold text-emerald-600">
                    Paid
                  </p>
                  <p className="mt-3 text-xl text-slate-500">
                    Confirmado por Stripe
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    From
                  </p>
                  <p className="mt-4 text-2xl font-bold text-slate-900">
                    Tu Empresa LLC
                  </p>
                  <p className="mt-3 text-lg text-slate-500">
                    info@empresa.com
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Bill To
                  </p>
                  <p className="mt-4 text-2xl font-bold text-slate-900">
                    Cliente Demo
                  </p>
                  <p className="mt-3 text-lg text-slate-500">
                    cliente@email.com
                  </p>
                  <p className="mt-2 text-lg text-slate-500">
                    Issue: Apr 16, 2026
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-lg font-semibold text-slate-500">
                  <span>Servicio</span>
                  <span>Total</span>
                </div>

                <div className="flex items-center justify-between py-4 text-xl text-slate-800">
                  <span>Diseño + facturación premium</span>
                  <span className="font-semibold">$299.00</span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-2xl font-bold text-slate-950">
                  <span>Total</span>
                  <span>$299.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}