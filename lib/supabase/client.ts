"use client";

import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

function buildClient() {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ✅ nuevo estándar
export function createClient() {
  return buildClient();
}

// ✅ compatibilidad (para no romper nada)
export const createBrowserClient = createClient;