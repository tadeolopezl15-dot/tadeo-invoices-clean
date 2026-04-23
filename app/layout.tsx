import type { Metadata } from "next";
import "./globals.css";
import "@/styles/ui-premium.css";
import { LanguageProvider } from "@/components/LanguageProvider";

export const metadata: Metadata = {
  title: "Tadeo Invoices",
  description: "Crea, comparte y cobra facturas profesionalmente.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}