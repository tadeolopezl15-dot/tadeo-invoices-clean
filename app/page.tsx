import Link from "next/link";

const features = [
  {
    icon: "⚡",
    title: "Fast invoicing",
    description: "Create invoices in seconds and send them instantly.",
  },
  {
    icon: "💳",
    title: "Online payments",
    description: "Accept payments directly from your clients securely.",
  },
  {
    icon: "📊",
    title: "Business control",
    description: "Track invoices, clients and revenue in one place.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/50 to-white text-slate-950">
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="rounded-[2rem] border border-slate-200 bg-white/85 p-5 shadow-xl shadow-blue-900/5 backdrop-blur-xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-2xl font-black text-white">
                TI
              </div>
              <div>
                <p className="text-2xl font-black leading-none">
                  Tadeo
                  <br />
                  Invoices
                </p>
                <p className="text-sm font-semibold text-slate-500">
                  Billing SaaS
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-2 text-sm font-black text-slate-950">
              <Link href="/" className="rounded-2xl bg-blue-50 px-5 py-3 text-blue-700">
                Inicio
              </Link>
              <Link href="/dashboard" className="rounded-2xl px-5 py-3 hover:bg-blue-50">
                Dashboard
              </Link>
              <Link href="/invoice" className="rounded-2xl px-5 py-3 hover:bg-blue-50">
                Facturas
              </Link>
              <Link href="/pricing" className="rounded-2xl px-5 py-3 hover:bg-blue-50">
                Precios
              </Link>
              <Link href="/configuracion" className="rounded-2xl px-5 py-3 hover:bg-blue-50">
                Configuración
              </Link>
            </nav>

            <Link
              href="/invoice/new"
              className="rounded-2xl bg-blue-700 px-6 py-4 text-center text-lg font-black text-white shadow-xl shadow-blue-700/25 hover:bg-blue-600"
            >
              + Nueva factura
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-24 max-w-5xl text-center">
          <h1 className="text-5xl font-black leading-tight tracking-tight md:text-7xl">
            Invoicing simple,
            <br />
            <span className="text-blue-700">payments</span> faster
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl font-medium leading-8 text-slate-600">
            Create professional invoices, accept online payments and manage your
            business from one place.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-5">
            <Link
              href="/invoice"
              className="rounded-2xl bg-blue-700 px-8 py-4 text-lg font-black text-white shadow-xl shadow-blue-700/25 hover:bg-blue-600"
            >
              Get started →
            </Link>

            <Link
              href="/pricing"
              className="rounded-2xl px-8 py-4 text-lg font-black text-blue-700 hover:bg-blue-50"
            >
              View pricing →
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-7 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-500 to-blue-800 p-8 text-white shadow-2xl shadow-blue-800/20"
            >
              <div className="absolute right-6 top-6 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />

              <div className="relative">
                <div className="mb-10 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 text-4xl shadow-lg">
                  {feature.icon}
                </div>

                <h2 className="text-4xl font-black leading-tight text-white">
                  {feature.title}
                </h2>

                <p className="mt-5 text-xl leading-8 text-blue-50">
                  {feature.description}
                </p>

                <div className="mt-12 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-3xl font-black text-white">
                  →
                </div>
              </div>
            </div>
          ))}
        </div>

        <section className="mt-16 overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 to-slate-950 px-6 py-16 text-center text-white shadow-2xl shadow-blue-900/20">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 text-4xl">
            📄
          </div>

          <h2 className="mx-auto max-w-3xl text-4xl font-black leading-tight md:text-5xl">
            Start your invoicing system today
          </h2>

          <p className="mt-5 text-lg text-blue-100">
            Join professionals already using Tadeo Invoices.
          </p>

          <Link
            href="/invoice/new"
            className="mt-9 inline-flex rounded-2xl bg-white px-10 py-4 text-lg font-black text-blue-700 shadow-xl hover:bg-blue-50"
          >
            Get started now →
          </Link>
        </section>
      </section>
    </main>
  );
}