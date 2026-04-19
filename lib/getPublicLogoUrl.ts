import { createClient } from "@supabase/supabase-js";

export function getPublicLogoUrl(path: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data } = supabase.storage.from("company-logos").getPublicUrl(path);

  return data.publicUrl;
}