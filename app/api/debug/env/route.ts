import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    starter: Boolean(process.env.STRIPE_PRICE_STARTER),
    pro: Boolean(process.env.STRIPE_PRICE_PRO),
    business: Boolean(process.env.STRIPE_PRICE_BUSINESS),

    oldStarter: Boolean(process.env.STRIPE_PRICE_ID_STARTER),
    oldPro: Boolean(process.env.STRIPE_PRICE_ID_PRO),
    oldBusiness: Boolean(process.env.STRIPE_PRICE_ID_BUSINESS),
  });
}