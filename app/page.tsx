import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_45%,_#ffffff_100%)] text-slate-900">
      <SiteHeader />

      <section className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6 md:py-16 lg:px-8 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700 md:text-sm">
              Facturación profesional con imagen premium
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl xl:text-7xl">
              Crea, comparte y cobra facturas con un diseño profesional en móvil
              y en PC.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              Tadeo Invoices te permite generar facturas limpias, administrar
              clientes, compartir links públicos y cobrar con una experiencia
              moderna tipo SaaS.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 md:px-6 md:py-3.5 md:text-base"
              >
                Empezar ahora
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 md:px-6 md:py-3.5 md:text-base"
              >
                Ver pricing
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-2xl font-bold text-slate-950">+Rápido</p>
                <p className="mt-2 text-sm text-slate-600">
                  Crea facturas en minutos desde cualquier dispositivo.
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-2xl font-bold text-slate-950">+Premium</p>
                <p className="mt-2 text-sm text-slate-600">
                  Diseño limpio, elegante y listo para clientes reales.
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-2xl font-bold text-slate-950">+Flexible</p>
                <p className="mt-2 text-sm text-slate-600">
                  Funciona bien en móvil, tablet, laptop y escritorio.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[680px] rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_20px_70px_rgba(15,23,42,0.10)] sm:p-4 md:p-5">
              <div className="mb-3 flex gap-2 px-1">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>

              <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:p-5 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <Image
                      src="/logo-tadeo-invoices.png"
                      alt="Tadeo Invoices"
                      width={220}
                      height={70}
                      className="h-auto w-[140px] object-contain sm:w-[170px] md:w-[200px]"
                      priority
                    />
                  </div>

                  <div className="rounded-[22px] bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 md:min-w-[180px]">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Payment status
                    </p>
                    <p className="mt-2 text-3xl font-bold text-emerald-600 sm:text-4xl">
                      Paid
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Confirmado por Stripe
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      From
                    </p>
                    <p className="mt-3 text-lg font-bold text-slate-950 sm:text-xl">
                      Tu Empresa LLC
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      info@empresa.com
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Bill to
                    </p>
                    <p className="mt-3 text-lg font-bold text-slate-950 sm:text-xl">
                      Cliente Demo
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      cliente@email.com
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-[22px] border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-sm font-semibold text-slate-500">
                    <span>Servicio</span>
                    <span>Total</span>
                  </div>

                  <div className="flex items-center justify-between py-4 text-sm text-slate-800 sm:text-base">
                    <span>Diseño + facturación premium</span>
                    <span className="font-semibold">$299.00</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-lg font-bold text-slate-950 sm:text-xl">
                    <span>Total</span>
                    <span>$299.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}