import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  // 🔥 CUANDO EL USUARIO PAGA
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const customerId = session.customer as string;
    const email = session.customer_email;

    // 🔍 Buscar usuario por email
    const { data: user } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (!user) {
      console.log("Usuario no encontrado");
      return NextResponse.json({ ok: true });
    }

    // 🔥 ACTUALIZAR A PRO
    await supabase
      .from("profiles")
      .update({
        plan: "pro",
        stripe_customer_id: customerId,
        subscription_status: "active",
      })
      .eq("id", user.id);
  }

  return NextResponse.json({ received: true });
}