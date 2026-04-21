import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import SignupScreen from "@/components/signup/SignupScreen";

export default async function SignupPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_45%,_#ffffff_100%)] px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_460px] lg:gap-12">
          <div className="hidden lg:block">
            <div className="max-w-xl">
              <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                Empieza hoy
              </p>
              <h1 className="mt-5 text-5xl font-bold tracking-tight text-slate-950">
                Crea tu cuenta y empieza a facturar con estilo.
              </h1>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Diseñado para verse bien en móvil y en PC, con una experiencia
                moderna para negocios reales.
              </p>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-6 md:p-8">
            <SignupScreen />
          </div>
        </div>
      </div>
    </main>
  );
}