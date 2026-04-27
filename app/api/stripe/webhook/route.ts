import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getPlanFromPriceId(priceId?: string | null) {
  if (!priceId) return "free";

  if (
    priceId === process.env.STRIPE_PRICE_STARTER ||
    priceId === process.env.STRIPE_PRICE_ID_STARTER
  ) {
    return "starter";
  }

  if (
    priceId === process.env.STRIPE_PRICE_PRO ||
    priceId === process.env.STRIPE_PRICE_ID_PRO
  ) {
    return "pro";
  }

  if (
    priceId === process.env.STRIPE_PRICE_BUSINESS ||
    priceId === process.env.STRIPE_PRICE_ID_BUSINESS
  ) {
    return "business";
  }

  return "free";
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

      if (session.metadata?.type === "invoice_payment") {
        const invoiceId = session.metadata.invoice_id;

        await supabaseAdmin
          .from("invoices")
          .update({
            status: "paid",
            payment_status: "paid",
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : null,
            paid_at: new Date().toISOString(),
          })
          .eq("id", invoiceId);
      }

      if (session.metadata?.user_id && session.metadata?.plan) {
        const userId = session.metadata.user_id;
        const plan = session.metadata.plan;

        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null;

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id ?? null;

        await supabaseAdmin
          .from("profiles")
          .update({
            plan,
            subscription_status: "active",
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            membership_updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
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

      await supabaseAdmin
        .from("profiles")
        .update({
          plan,
          subscription_status: subscription.status,
          stripe_subscription_id: subscription.id,
          membership_updated_at: new Date().toISOString(),
        })
        .eq("stripe_customer_id", customerId);
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      await supabaseAdmin
        .from("profiles")
        .update({
          plan: "free",
          subscription_status: "canceled",
          stripe_subscription_id: subscription.id,
          membership_updated_at: new Date().toISOString(),
        })
        .eq("stripe_customer_id", customerId);
    }

    if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice;

      const customerId =
        typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer?.id ?? null;

      if (customerId) {
        await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: "active",
            membership_updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("STRIPE_WEBHOOK_HANDLER_ERROR", error);
    return new NextResponse("Webhook handler error", { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/stripe/webhook",
  });
}