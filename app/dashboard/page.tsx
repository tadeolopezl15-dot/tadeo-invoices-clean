import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";

export default async function DashboardPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="ui-page">
      <AppHeader />

      <div className="ui-shell">
        <section className="ui-card p-6 md:p-8">
          <div className="ui-badge">Main Dashboard</div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
            Manage your business from one place
          </h1>

          <p className="mt-5 max-w-4xl text-base leading-8 text-slate-600 md:text-xl">
            Control invoices, clients, revenue, and payments with a modern,
            clean, and professional experience.
          </p>

          <div className="ui-actions mt-8">
            <Link href="/invoice/new" className="btn btn-primary">
              Create invoice
            </Link>
            <Link href="/clientes" className="btn btn-secondary">
              View clients
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}