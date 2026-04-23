import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import CompanySettingsForm from "@/components/settings/CompanySettingsForm";

export default async function ConfiguracionPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "company_name, company_email, company_phone, company_address, logo_url, plan"
    )
    .eq("id", user.id)
    .single();

  const plan = profile?.plan || "starter";
  const canUseLogo = plan === "pro" || plan === "business";

  return (
    <main className="ui-page">
      <AppHeader />

      <div className="ui-shell">
        <section className="ui-card p-6 md:p-8">
          <div className="ui-badge">Configuración</div>

          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
            Personaliza tu empresa
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 md:text-xl">
            Guarda los datos de tu empresa para mostrarlos correctamente en
            facturas, emails y pagos.
          </p>

          <div className="mt-6 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
            Plan actual: {plan}
          </div>
        </section>

        {!canUseLogo ? (
          <section className="mt-6 ui-panel">
            <h2 className="text-2xl font-bold text-slate-950">
              Logo disponible en Pro
            </h2>

            <p className="mt-3 text-slate-600">
              Tu plan actual permite configurar datos básicos de empresa. Para
              mostrar tu logo en facturas y emails, sube a Pro o Business.
            </p>

            <a href="/pricing" className="btn btn-primary mt-6">
              Upgrade plan
            </a>
          </section>
        ) : null}

        <section className="mt-6">
          <CompanySettingsForm
            canUseLogo={canUseLogo}
            initialData={{
              company_name: profile?.company_name || "",
              company_email: profile?.company_email || "",
              company_phone: profile?.company_phone || "",
              company_address: profile?.company_address || "",
              logo_url: canUseLogo ? profile?.logo_url || "" : "",
            }}
          />
        </section>
      </div>
    </main>
  );
}