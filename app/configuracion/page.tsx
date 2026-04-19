import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import SettingsScreen from "@/components/settings/SettingsScreen";

export default async function ConfiguracionPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, company_name, logo_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("SETTINGS_LOAD_ERROR", profileError);
  }

  async function updateProfile(formData: FormData) {
    "use server";

    const supabase = await createServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect("/login");
    }

    const full_name = String(formData.get("full_name") || "").trim();
    const company_name = String(formData.get("company_name") || "").trim();
    const logo_url = String(formData.get("logo_url") || "").trim();

    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name: full_name || null,
        company_name: company_name || null,
        logo_url: logo_url || null,
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("SETTINGS_SAVE_ERROR", error);
      redirect("/configuracion?error=No%20se%20pudieron%20guardar%20los%20cambios");
    }

    redirect("/configuracion?saved=1");
  }

  return (
    <SettingsScreen
      action={updateProfile}
      user={{
        fullName: profile?.full_name || "",
        companyName: profile?.company_name || "",
        logoUrl: profile?.logo_url || "",
        email: user.email || "",
      }}
    />
  );
}