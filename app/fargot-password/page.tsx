import { createServerClient } from "@/lib/supabase/server";
import ForgotPasswordScreen from "@/components/auth/ForgotPasswordScreen";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const errorMessage = params?.error ? decodeURIComponent(params.error) : "";
  const successMessage = params?.success
    ? decodeURIComponent(params.success)
    : "";

  async function sendReset(formData: FormData) {
    "use server";

    const supabase = await createServerClient();

    const email = String(formData.get("email") || "").trim();

    if (!email) {
      const { redirect } = await import("next/navigation");
      redirect("/forgot-password?error=Completa%20el%20correo%20electr%C3%B3nico");
    }

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
    const redirectTo = siteUrl
      ? `${siteUrl}/update-password`
      : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      console.error("RESET_PASSWORD_ERROR", error);
      const { redirect } = await import("next/navigation");
      redirect("/forgot-password?error=No%20se%20pudo%20enviar%20el%20correo%20de%20recuperaci%C3%B3n");
    }

    const { redirect } = await import("next/navigation");
    redirect(
      "/forgot-password?success=Si%20el%20correo%20existe%2C%20te%20enviamos%20un%20enlace%20para%20restablecer%20tu%20contrase%C3%B1a"
    );
  }

  return (
    <ForgotPasswordScreen
      action={sendReset}
      errorMessage={errorMessage}
      successMessage={successMessage}
    />
  );
}