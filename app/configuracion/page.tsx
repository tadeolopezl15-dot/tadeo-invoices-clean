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
        {/* HEADER */}
        <section className="ui-card p-6 md:p-8">
          <div>
            <div className="ui-badge">Configuración</div>

            <h1 className="mt-3 text-3xl font-extrabold text-slate-950 md:text-5xl">
              Ajustes de empresa
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Personaliza tu logo y los datos que aparecerán en tus facturas.
            </p>
          </div>
        </section>

        {/* LOGO PRO UI */}
        <section className="ui-card mt-6 overflow-hidden p-0">
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 to-blue-700 p-6 md:p-8">
            <div className="ui-badge bg-white/10 text-white">Branding</div>

            <h2 className="mt-4 text-3xl font-black text-white">
              Logo de la empresa
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-blue-100">
              Este logo aparecerá en tus facturas, PDF y correos enviados a tus
              clientes.
            </p>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-[280px_1fr] md:p-8">
            {/* PREVIEW */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex h-44 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white">
                {profile?.logo_url ? (
                  <img
                    src={profile.logo_url}
                    alt="Logo"
                    className="max-h-32 max-w-[200px] object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                      ✦
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-500">
                      Sin logo todavía
                    </p>
                  </div>
                )}
              </div>

              <p className="mt-4 text-center text-xs text-slate-400">
                PNG recomendado · fondo transparente · 500×500 px
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col justify-center">
              <h3 className="text-xl font-black text-slate-950">
                Sube o reemplaza tu logo
              </h3>

              <p className="mt-2 max-w-xl text-sm text-slate-500">
                Si subes uno nuevo, reemplazará automáticamente el logo actual.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <LogoUploader userId={user.id} />
                <DeleteLogoButton />
              </div>

              {profile?.logo_url ? (
                <p className="mt-4 text-xs font-semibold text-emerald-600">
                  Logo activo en tu cuenta
                </p>
              ) : (
                <p className="mt-4 text-xs font-semibold text-amber-600">
                  Aún no tienes logo configurado
                </p>
              )}
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
            <div>
              <label className="text-sm font-semibold text-slate-600">
                Nombre de la empresa
              </label>
              <input
                name="company_name"
                defaultValue={profile?.company_name || ""}
                className="input mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Email
              </label>
              <input
                name="company_email"
                defaultValue={profile?.company_email || ""}
                className="input mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Teléfono
              </label>
              <input
                name="company_phone"
                defaultValue={profile?.company_phone || ""}
                className="input mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Dirección
              </label>
              <input
                name="company_address"
                defaultValue={profile?.company_address || ""}
                className="input mt-2"
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