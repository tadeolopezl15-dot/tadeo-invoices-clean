import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error("Missing Supabase admin env vars");
  }

  return createClient(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function mapPriceIdToPlan(priceId: string | null | undefined) {
  if (!priceId) return "starter";

  if (priceId === process.env.STRIPE_PRICE_ID_STARTER) return "starter";
  if (priceId === process.env.STRIPE_PRICE_ID_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_ID_BUSINESS) return "business";

  return "starter";
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const supabaseAdmin = getAdminSupabase();

  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: "Missing Stripe signature or webhook secret" },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.user_id || null;
      const plan = session.metadata?.plan || "starter";
      const customerId =
        typeof session.customer === "string" ? session.customer : null;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : null;

      if (userId) {
        await supabaseAdmin
          .from("profiles")
          .update({
            plan,
            stripe_customer_id: customerId,
            subscription_id: subscriptionId,
            subscription_status: "active",
          })
          .eq("id", userId);
      }
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      const subscription = event.data.object as Stripe.Subscription;

      const userId = subscription.metadata?.user_id || null;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : null;

      const firstItem = subscription.items.data[0];
      const priceId = firstItem?.price?.id || null;

      const plan =
        subscription.metadata?.plan || mapPriceIdToPlan(priceId) || "starter";

      if (userId) {
        await supabaseAdmin
          .from("profiles")
          .update({
            plan,
            stripe_customer_id: customerId,
            subscription_id: subscription.id,
            subscription_status: subscription.status,
          })
          .eq("id", userId);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      const userId = subscription.metadata?.user_id || null;

      if (userId) {
        await supabaseAdmin
          .from("profiles")
          .update({
            plan: "starter",
            subscription_id: subscription.id,
            subscription_status: subscription.status,
          })
          .eq("id", userId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("STRIPE_WEBHOOK_ERROR", error);

    return NextResponse.json(
      { error: "Webhook error" },
      { status: 400 }
    );
  }
}