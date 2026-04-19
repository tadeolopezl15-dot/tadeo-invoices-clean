import { NextResponse } from "next/server";
import { createStripeClient } from "@/lib/stripe";
import { env } from "@/lib/env";

const priceMap: Record<string, string | undefined> = {
  starter: env.STRIPE_PRICE_ID_STARTER,
  pro: env.STRIPE_PRICE_ID_PRO,
  business: env.STRIPE_PRICE_ID_BUSINESS,
};

export async function POST(req: Request) {
  try {
    const stripe = createStripeClient();
    const body = await req.json();
    const plan = body?.plan as string | undefined;

    if (!plan) {
      return NextResponse.json(
        { error: "Falta el plan" },
        { status: 400 }
      );
    }

    const priceId = priceMap[plan];

    if (!priceId) {
      return NextResponse.json(
        { error: "Plan inválido o falta el price id" },
        { status: 400 }
      );
    }

    const origin =
      req.headers.get("origin") ||
      env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/membresias/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/membresias/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("CHECKOUT_ROUTE_ERROR", error);
    return NextResponse.json(
      { error: "No se pudo crear la sesión de pago" },
      { status: 500 }
    );
  }
}