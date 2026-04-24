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

function getPlanFromPrice(priceId?: string | null) {
  if (!priceId) return "free";

  if (priceId === process.env.STRIPE_PRICE_ID_STARTER) return "starter";
  if (priceId === process.env.STRIPE_PRICE_ID_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_ID_BUSINESS) return "business";

  return "free";
}

async function updateProfileByUserId({
  userId,
  plan,
  customerId,
  subscriptionId,
  status,
}: {
  userId: string;
  plan: string;
  customerId: string | null;
  subscriptionId: string | null;
  status: string | null;
}) {
  const supabaseAdmin = getAdminSupabase();

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      plan,
      stripe_customer_id: customerId,
      subscription_id: subscriptionId,
      subscription_status: status,
    })
    .eq("id", userId);

  if (error) {
    console.error("UPDATE_PROFILE_BY_USER_ID_ERROR", error);
  }
}

async function updateProfileByCustomerId({
  customerId,
  plan,
  subscriptionId,
  status,
}: {
  customerId: string;
  plan: string;
  subscriptionId: string | null;
  status: string | null;
}) {
  const supabaseAdmin = getAdminSupabase();

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      plan,
      subscription_id: subscriptionId,
      subscription_status: status,
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("UPDATE_PROFILE_BY_CUSTOMER_ID_ERROR", error);
  }
}

export async function POST(req: Request) {
  const stripe = getStripe();

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
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
      const plan = session.metadata?.plan || "pro";

      const customerId =
        typeof session.customer === "string" ? session.customer : null;

      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : null;

      if (userId) {
        await updateProfileByUserId({
          userId,
          plan,
          customerId,
          subscriptionId,
          status: "active",
        });
      } else if (customerId) {
        await updateProfileByCustomerId({
          customerId,
          plan,
          subscriptionId,
          status: "active",
        });
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
        subscription.metadata?.plan || getPlanFromPrice(priceId) || "pro";

      if (userId) {
        await updateProfileByUserId({
          userId,
          plan,
          customerId,
          subscriptionId: subscription.id,
          status: subscription.status,
        });
      } else if (customerId) {
        await updateProfileByCustomerId({
          customerId,
          plan,
          subscriptionId: subscription.id,
          status: subscription.status,
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      const userId = subscription.metadata?.user_id || null;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : null;

      if (userId) {
        await updateProfileByUserId({
          userId,
          plan: "free",
          customerId,
          subscriptionId: subscription.id,
          status: subscription.status,
        });
      } else if (customerId) {
        await updateProfileByCustomerId({
          customerId,
          plan: "free",
          subscriptionId: subscription.id,
          status: subscription.status,
        });
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