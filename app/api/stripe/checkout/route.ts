import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

const PRICE_MAP = {
  starter: process.env.STRIPE_PRICE_ID_STARTER!,
  pro: process.env.STRIPE_PRICE_ID_PRO!,
  business: process.env.STRIPE_PRICE_ID_BUSINESS!,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const plan = body?.plan as "starter" | "pro" | "business";
    const userId = body?.userId as string;

    if (!plan || !PRICE_MAP[plan]) {
      return NextResponse.json({ error: "Plan inválido." }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Falta userId." }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: PRICE_MAP[plan],
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/membresias/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/membresias/cancel`,
      metadata: {
        userId,
        plan,
      },
      subscription_data: {
        metadata: {
          userId,
          plan,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("STRIPE_CHECKOUT_ERROR", error);
    return NextResponse.json(
      { error: "No se pudo crear la sesión de pago." },
      { status: 500 }
    );
  }
}