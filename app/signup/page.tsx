import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import SignupScreen from "@/components/signup/SignupScreen";

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const errorMessage = params?.error ? decodeURIComponent(params.error) : "";
  const successMessage = params?.success
    ? decodeURIComponent(params.success)
    : "";

  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  async function signup(formData: FormData) {
    "use server";

    const supabase = await createServerClient();

    const fullName = String(formData.get("full_name") || "").trim();
    const companyName = String(formData.get("company_name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();
    const confirmPassword = String(formData.get("confirm_password") || "").trim();

    if (!fullName || !email || !password || !confirmPassword) {
      redirect("/signup?error=Completa%20todos%20los%20campos%20obligatorios");
    }

    if (password.length < 6) {
      redirect("/signup?error=La%20contrase%C3%B1a%20debe%20tener%20al%20menos%206%20caracteres");
    }

    if (password !== confirmPassword) {
      redirect("/signup?error=Las%20contrase%C3%B1as%20no%20coinciden");
    }

    const emailRedirectTo =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") + "/dashboard";

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          full_name: fullName,
          company_name: companyName,
        },
      },
    });

    if (error) {
      console.error("SIGNUP_ERROR", error);
      redirect("/signup?error=No%20se%20pudo%20crear%20la%20cuenta");
    }

    const userId = data.user?.id;

    if (userId) {
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          full_name: fullName,
          company_name: companyName || null,
          role: "member",
        },
        { onConflict: "id" }
      );

      if (profileError) {
        console.error("PROFILE_CREATE_ERROR", profileError);
      }
    }

    redirect(
      "/signup?success=Cuenta%20creada.%20Revisa%20tu%20correo%20si%20tu%20proyecto%20requiere%20confirmaci%C3%B3n"
    );
  }

  return (
    <SignupScreen
      action={signup}
      errorMessage={errorMessage}
      successMessage={successMessage}
    />
  );
}