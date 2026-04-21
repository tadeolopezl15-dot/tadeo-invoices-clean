import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

export default async function ConfiguracionPage() {
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
    .select("company_name, company_email, company_phone, company_address, logo_url")
    .eq("id", user.id)
    .single();

  async function saveSettings(formData: FormData) {
    "use server";

    const supabase = await createServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect("/login");
    }

    const companyName = String(formData.get("company_name") || "").trim();
    const companyEmail = String(formData.get("company_email") || "").trim();
    const companyPhone = String(formData.get("company_phone") || "").trim();
    const companyAddress = String(formData.get("company_address") || "").trim();

    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        company_name: companyName || null,
        company_email: companyEmail || null,
        company_phone: companyPhone || null,
        company_address: companyAddress || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("SETTINGS_SAVE_ERROR", error);
      redirect("/configuracion?error=save");
    }

    redirect("/configuracion?success=1");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_45%,_#ffffff_100%)] px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                Configuración
              </p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                Empresa y logo
              </h1>
              <p className="mt-2 text-sm text-slate-600 md:text-base">
                Personaliza tus datos y sube el logo que aparecerá en tus facturas.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
            >
              Volver al dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <form
            action={saveSettings}
            className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nombre de la empresa
                </label>
                <input
                  type="text"
                  name="company_name"
                  defaultValue={profile?.company_name || ""}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Correo de la empresa
                </label>
                <input
                  type="email"
                  name="company_email"
                  defaultValue={profile?.company_email || ""}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Teléfono
                </label>
                <input
                  type="text"
                  name="company_phone"
                  defaultValue={profile?.company_phone || ""}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Dirección
                </label>
                <input
                  type="text"
                  name="company_address"
                  defaultValue={profile?.company_address || ""}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Guardar cambios
            </button>
          </form>

          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-950">Logo actual</h2>

            <div className="mt-5 flex min-h-[220px] items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-6">
              {profile?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.logo_url}
                  alt="Logo"
                  className="max-h-[160px] w-auto object-contain"
                />
              ) : (
                <p className="text-sm text-slate-500">Aún no has subido un logo.</p>
              )}
            </div>

            <form
              action="/api/settings/upload-logo"
              method="post"
              encType="multipart/form-data"
              className="mt-5"
            >
              <input
                type="file"
                name="logo"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                required
              />
              <button
                type="submit"
                className="mt-4 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
              >
                Subir logo
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}