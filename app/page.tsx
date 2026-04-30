import AppHeader from "@/components/AppHeader";
import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <AppHeader />

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h1 className="text-5xl font-black">
          Create, send and get paid faster
        </h1>

        <p className="mt-4 text-slate-600">
          Professional invoicing platform for modern businesses.
        </p>

        <div className="mt-6 flex gap-3">
          <Link href="/signup" className="btn btn-primary">
            Get started
          </Link>

          <Link href="/pricing" className="btn btn-secondary">
            View pricing
          </Link>
        </div>
      </section>
    </main>
  );
}