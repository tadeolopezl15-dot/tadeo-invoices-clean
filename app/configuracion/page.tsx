import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import LogoUploader from "@/components/LogoUploader";
import DeleteLogoButton from "@/components/DeleteLogoButton";

export default async function ConfiguracionPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="ui-page">
      <AppHeader />

      <div className="ui-shell">
        <section className="ui-card p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="ui-badge">Configuración</div>

              <h1 className="mt-3 text-3xl font-extrabold text-slate-950 md:text-5xl">
                Ajustes de empresa
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Personaliza tu información, logo y datos que aparecerán en las
                facturas y PDF.
              </p>
            </div>
          </div>
        </section>

        {/* LOGO */}
        <section className="ui-card mt-6 p-6 md:p-8">
          <h2 className="text-xl font-black text-slate-950">
            Logo de la empresa
          </h2>

          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6">
              {profile?.logo_url ? (
                <img
                  src={profile.logo_url}
                  alt="Logo"
                  className="h-24 w-auto object-contain"
                />
              ) : (
                <span className="text-sm text-slate-400">
                  No tienes logo aún
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <LogoUploader />

              {profile?.logo_url && <DeleteLogoButton />}
            </div>
          </div>
        </section>

        {/* DATOS EMPRESA */}
        <section className="ui-card mt-6 p-6 md:p-8">
          <h2 className="text-xl font-black text-slate-950">
            Datos de la empresa
          </h2>

          <form
            action="/api/settings/update"
            method="POST"
            className="mt-6 grid gap-5 md:grid-cols-2"
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-600">
                Nombre de la empresa
              </label>
              <input
                name="company_name"
                defaultValue={profile?.company_name || ""}
                className="input"
                placeholder="Ej: Tadeo Invoices LLC"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-600">
                Email
              </label>
              <input
                name="company_email"
                defaultValue={profile?.company_email || ""}
                className="input"
                placeholder="email@empresa.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-600">
                Teléfono
              </label>
              <input
                name="company_phone"
                defaultValue={profile?.company_phone || ""}
                className="input"
                placeholder="+1 813 000 0000"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-600">
                Dirección
              </label>
              <input
                name="company_address"
                defaultValue={profile?.company_address || ""}
                className="input"
                placeholder="Dirección completa"
              />
            </div>

            <div className="md:col-span-2">
              <button type="submit" className="btn btn-primary w-full md:w-auto">
                Guardar cambios
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}