import { cookies } from "next/headers";
import type { Lang } from "@/lib/i18n";

export async function getServerLang(): Promise<Lang> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("app_lang")?.value;
  return lang === "en" ? "en" : "es";
}