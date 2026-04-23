import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";

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
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <main className="ui-page">
      <AppHeader />

      <div className="ui-shell">
        <div className="ui-card p-6 md:p-8">
          <p className="ui-badge">Configuración</p>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
            Personaliza tu empresa
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-xl">
            Configura tu marca, correo, teléfono y datos de empresa para mostrar
            una imagen profesional en facturas y pagos.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="ui-panel">
              <label className="ui-label">Empresa</label>
              <input className="ui-input" defaultValue={profile?.company_name || ""} />

              <label className="ui-label mt-4">Correo</label>
              <input className="ui-input" defaultValue={profile?.company_email || ""} />

              <label className="ui-label mt-4">Teléfono</label>
              <input className="ui-input" defaultValue={profile?.company_phone || ""} />
            </div>

            <div className="ui-panel">
              <label className="ui-label">Dirección</label>
              <textarea
                className="ui-textarea min-h-[160px]"
                defaultValue={profile?.company_address || ""}
              />

              <button type="button" className="btn btn-primary mt-6 w-full">
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}