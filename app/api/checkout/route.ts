import { NextResponse } from "next/server";
import { createStripeClient } from "@/lib/stripe";
import { env } from "@/lib/env";

const priceMap: Record<string, string | undefined> = {
  Starter: process.env.STRIPE_PRICE_ID_STARTER,
  Pro: process.env.STRIPE_PRICE_ID_PRO,
  Business: process.env.STRIPE_PRICE_ID_BUSINESS,
};

export async function POST(req: Request) {
  try {
    const { planName, supabaseUserId, email } = await req.json();

    const priceId = priceMap[planName];
    if (!priceId) {
      return NextResponse.json(
        { error: `No existe un Price ID configurado para el plan ${planName}.` },
        { status: 400 }
      );
    }

    const stripe = createStripeClient();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${env.siteUrl}/dashboard?checkout=success`,
      cancel_url: `${env.siteUrl}/pricing?checkout=cancelled`,
      metadata: {
        supabaseUserId,
        planName,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
