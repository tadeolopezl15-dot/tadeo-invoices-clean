import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import UpdatePasswordScreen from "@/components/auth/UpdatePasswordScreen";

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const errorMessage = params?.error ? decodeURIComponent(params.error) : "";
  const successMessage = params?.success
    ? decodeURIComponent(params.success)
    : "";

  async function updatePassword(formData: FormData) {
    "use server";

    const supabase = await createServerClient();

    const password = String(formData.get("password") || "").trim();
    const confirmPassword = String(formData.get("confirm_password") || "").trim();

    if (!password || !confirmPassword) {
      redirect("/update-password?error=Completa%20todos%20los%20campos");
    }

    if (password.length < 6) {
      redirect(
        "/update-password?error=La%20contrase%C3%B1a%20debe%20tener%20al%20menos%206%20caracteres"
      );
    }

    if (password !== confirmPassword) {
      redirect("/update-password?error=Las%20contrase%C3%B1as%20no%20coinciden");
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      console.error("UPDATE_PASSWORD_ERROR", error);
      redirect(
        "/update-password?error=No%20se%20pudo%20actualizar%20la%20contrase%C3%B1a"
      );
    }

    redirect(
      "/login?error=Contrase%C3%B1a%20actualizada%20correctamente.%20Ya%20puedes%20iniciar%20sesi%C3%B3n"
    );
  }

  return (
    <UpdatePasswordScreen
      action={updatePassword}
      errorMessage={errorMessage}
      successMessage={successMessage}
    />
  );
}