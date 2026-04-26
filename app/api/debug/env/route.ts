import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    // URL del sitio
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,

    // Nuevas variables correctas
    STRIPE_PRICE_STARTER: process.env.STRIPE_PRICE_STARTER || null,
    STRIPE_PRICE_PRO: process.env.STRIPE_PRICE_PRO || null,
    STRIPE_PRICE_BUSINESS: process.env.STRIPE_PRICE_BUSINESS || null,

    // Variables antiguas (para verificar si aún existen)
    STRIPE_PRICE_ID_STARTER: process.env.STRIPE_PRICE_ID_STARTER || null,
    STRIPE_PRICE_ID_PRO: process.env.STRIPE_PRICE_ID_PRO || null,
    STRIPE_PRICE_ID_BUSINESS: process.env.STRIPE_PRICE_ID_BUSINESS || null,
  });
}