import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import LoginScreen from "@/components/login/LoginScreen";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  // Obtener parámetros (error en URL)
  const params = searchParams ? await searchParams : {};
  const errorMessage = params?.error ? decodeURIComponent(params.error) : "";

  // Cliente Supabase
  const supabase = await createServerClient();

  // Verificar si ya está logueado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si ya está dentro → redirigir
  if (user) {
    redirect("/dashboard");
  }

  // Acción de login (SERVER ACTION)
  async function login(formData: FormData) {
    "use server";

    const supabase = await createServerClient();

    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();

    // Validación básica
    if (!email || !password) {
      redirect("/login?error=Completa%20todos%20los%20campos");
    }

    // Intentar login
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("LOGIN_ERROR", error);
      redirect("/login?error=Credenciales%20incorrectas");
    }

    // Login exitoso
    redirect("/dashboard");
  }

  // Render pantalla PRO (client component)
  return (
    <LoginScreen
      action={login}
      errorMessage={errorMessage}
    />
  );
}