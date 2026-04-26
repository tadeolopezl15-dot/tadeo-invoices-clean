import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

function getPlanFromPriceId(priceId?: string | null) {
  if (!priceId) return "free";

  if (priceId === process.env.STRIPE_PRICE_STARTER) return "starter";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_BUSINESS) return "business";

  return "free";
}

async function updateProfileByUserId(params: {
  userId: string;
  customerId?: string | null;
  subscriptionId?: string | null;
  plan?: string;
  status?: string;
}) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      plan: params.plan ?? "free",
      subscription_status: params.status ?? "inactive",
      stripe_customer_id: params.customerId ?? null,
      stripe_subscription_id: params.subscriptionId ?? null,
      membership_updated_at: new Date().toISOString(),
    })
    .eq("id", params.userId);

  if (error) {
    console.error("SUPABASE_PROFILE_UPDATE_ERROR", error);
  }
}

async function updateProfileByCustomerId(params: {
  customerId: string;
  subscriptionId?: string | null;
  plan?: string;
  status?: string;
}) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      plan: params.plan ?? "free",
      subscription_status: params.status ?? "inactive",
      stripe_subscription_id: params.subscriptionId ?? null,
      membership_updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", params.customerId);

  if (error) {
    console.error("SUPABASE_CUSTOMER_UPDATE_ERROR", error);
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const headerStore = await headers();
  const signature = headerStore.get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("STRIPE_WEBHOOK_SIGNATURE_ERROR", error);
    return new NextResponse("Webhook signature error", { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId =
        session.metadata?.user_id || session.client_reference_id || null;

      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null;

      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id ?? null;

      let plan = session.metadata?.plan || "free";
      let status = "active";

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price?.id;
        plan = getPlanFromPriceId(priceId);
        status = subscription.status;
      }

      if (userId) {
        await updateProfileByUserId({
          userId,
          customerId,
          subscriptionId,
          plan,
          status,
        });
      }
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;

      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const priceId = subscription.items.data[0]?.price?.id;
      const plan = getPlanFromPriceId(priceId);

      await updateProfileByCustomerId({
        customerId,
        subscriptionId: subscription.id,
        plan,
        status: subscription.status,
      });
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      await updateProfileByCustomerId({
        customerId,
        subscriptionId: subscription.id,
        plan: "free",
        status: "canceled",
      });
    }

    if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice;

      const customerId =
        typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer?.id ?? null;

      if (customerId) {
        await updateProfileByCustomerId({
          customerId,
          status: "active",
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("STRIPE_WEBHOOK_HANDLER_ERROR", error);
    return new NextResponse("Webhook handler error", { status: 500 });
  }
}