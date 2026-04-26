import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import NewInvoiceScreen from "@/components/invoice/NewInvoiceScreen";

type Plan = "starter" | "pro" | "business";

function invoiceLimit(plan: Plan) {
  if (plan === "starter") return 5;
  if (plan === "pro") return 50;
  return Number.POSITIVE_INFINITY;
}

export default async function NewInvoicePage() {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();

  const plan = ((profile?.plan || "starter") as Plan);
  const limit = invoiceLimit(plan);

  const { count } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count || 0) >= limit) {
    return (
      <main className="ui-page">
        <AppHeader />

        <div className="ui-shell">
          <section className="ui-card p-8 text-center">
            <div className="ui-badge">Plan limit</div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
              Límite de facturas alcanzado
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Tu plan actual es <strong>{plan}</strong> y permite crear hasta{" "}
              <strong>{limit}</strong> facturas. Sube de plan para crear más
              facturas y desbloquear funciones premium.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/pricing" className="btn btn-primary">
                Upgrade plan
              </Link>

              <Link href="/invoice" className="btn btn-secondary">
                Ver facturas
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="ui-page">
      <AppHeader />

      <div className="ui-shell">
        <section className="ui-card p-6 md:p-8">
          <div className="ui-badge">Nueva factura</div>

          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
            Crear factura
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 md:text-xl">
            Plan actual: <strong>{plan}</strong>. Has creado{" "}
            <strong>{count || 0}</strong> de{" "}
            <strong>{Number.isFinite(limit) ? limit : "ilimitadas"}</strong>{" "}
            facturas disponibles.
          </p>
        </section>

        <section className="mt-6">
          <NewInvoiceScreen userId={user.id} />
        </section>
      </div>
    </main>
  );
}