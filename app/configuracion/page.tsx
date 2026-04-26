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

  // Logo disponible para todos los usuarios
  const canUseLogo = true;

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
            Cambia tu logo cuando quieras y guarda los datos de tu empresa para
            mostrarlos correctamente en facturas, emails y PDFs.
          </p>

          <div className="mt-6 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
            Plan actual: {plan}
          </div>
        </section>

        <section className="mt-6">
          <CompanySettingsForm
            canUseLogo={canUseLogo}
            initialData={{
              company_name: profile?.company_name || "",
              company_email: profile?.company_email || "",
              company_phone: profile?.company_phone || "",
              company_address: profile?.company_address || "",
              logo_url: profile?.logo_url || "",
            }}
          />
        </section>
      </div>
    </main>
  );
}