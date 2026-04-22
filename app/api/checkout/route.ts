import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

const PRICE_MAP: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_ID_STARTER,
  pro: process.env.STRIPE_PRICE_ID_PRO,
  business: process.env.STRIPE_PRICE_ID_BUSINESS,
};

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const stripe = getStripe();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const plan = String(body?.plan || "").toLowerCase();

    if (!["starter", "pro", "business"].includes(plan)) {
      return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
    }

    const priceId = PRICE_MAP[plan];
    if (!priceId) {
      return NextResponse.json(
        { error: `Falta STRIPE_PRICE_ID para ${plan}` },
        { status: 500 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, company_name")
      .eq("id", user.id)
      .single();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    let customerId = profile?.stripe_customer_id || null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: profile?.company_name || user.user_metadata?.full_name || undefined,
        metadata: {
          user_id: user.id,
        },
      });

      customerId = customer.id;

      await supabase
        .from("profiles")
        .update({
          stripe_customer_id: customerId,
        })
        .eq("id", user.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/membresias/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/membresias/cancel`,
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
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("CHECKOUT_ROUTE_ERROR", error);
    return NextResponse.json(
      { error: "No se pudo crear el checkout" },
      { status: 500 }
    );
  }
}