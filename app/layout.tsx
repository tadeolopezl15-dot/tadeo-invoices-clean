import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import type { Lang } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Tadeo Invoices",
  description: "Crea, comparte y cobra facturas profesionalmente.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get("app_lang")?.value;
  const initialLang: Lang = cookieLang === "en" ? "en" : "es";

  return (
    <html lang={initialLang}>
      <body>
        <LanguageProvider initialLang={initialLang}>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}