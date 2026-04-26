import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { stripe } from "@/lib/stripe";

type Plan = "starter" | "pro" | "business";

function getPriceId(plan: Plan) {
  const prices: Record<Plan, string | undefined> = {
    starter:
      process.env.STRIPE_PRICE_STARTER ||
      process.env.STRIPE_PRICE_ID_STARTER,

    pro:
      process.env.STRIPE_PRICE_PRO ||
      process.env.STRIPE_PRICE_ID_PRO,

    business:
      process.env.STRIPE_PRICE_BUSINESS ||
      process.env.STRIPE_PRICE_ID_BUSINESS,
  };

  return prices[plan];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const plan = body.plan as Plan;

    if (!plan || !["starter", "pro", "business"].includes(plan)) {
      return NextResponse.json(
        { error: "Plan inválido." },
        { status: 400 }
      );
    }

    const priceId = getPriceId(plan);

    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID no configurado para el plan: ${plan}` },
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
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesión primero." },
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
          price: priceId,
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
      { error: "No se pudo crear el checkout de Stripe." },
      { status: 500 }
    );
  }
}