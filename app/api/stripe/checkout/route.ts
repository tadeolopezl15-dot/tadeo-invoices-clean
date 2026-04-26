import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { stripe } from "@/lib/stripe";

type Plan = "starter" | "pro" | "business";

const PRICE_BY_PLAN: Record<Plan, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
  business: process.env.STRIPE_PRICE_BUSINESS,
};

export async function POST(req: Request) {
  try {
    const { plan } = (await req.json()) as { plan?: Plan };

    if (!plan || !PRICE_BY_PLAN[plan]) {
      return NextResponse.json(
        { error: "Plan inválido o Price ID no configurado." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para suscribirte." },
        { status: 401 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        plan,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan,
        },
      },
      line_items: [
        {
          price: PRICE_BY_PLAN[plan],
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?membership=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?membership=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("STRIPE_CHECKOUT_ERROR", error);
    return NextResponse.json(
      { error: "No se pudo crear el checkout." },
      { status: 500 }
    );
  }
}