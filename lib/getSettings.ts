import { createServerClient } from "@/lib/supabase/server";

export async function getSettings(userId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("GET_SETTINGS_ERROR", error);
    return null;
  }

  return data;
}