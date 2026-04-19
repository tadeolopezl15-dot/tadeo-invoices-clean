        import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import DashboardScreen from "@/components/dashboard/DashboardScreen";

export default async function DashboardPage() {
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
    .select("full_name, company_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "User";

  const companyName =
    profile?.company_name ||
    user.user_metadata?.company_name ||
    "My Business";

  const role = profile?.role || "member";

  return (
    <DashboardScreen
      user={{
        email: user.email || "",
        fullName: displayName,
        companyName,
        role,
      }}
    />
  );
}