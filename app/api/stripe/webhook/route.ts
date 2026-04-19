import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!stripeSecretKey) {
  throw new Error("Falta STRIPE_SECRET_KEY en .env.local");
}

if (!stripeWebhookSecret) {
  throw new Error("Falta STRIPE_WEBHOOK_SECRET en .env.local");
}

if (!supabaseUrl) {
  throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL en .env.local");
}

if (!supabaseServiceRoleKey) {
  throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en .env.local");
}

const stripe = new Stripe(stripeSecretKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("WEBHOOK_ERROR: Falta stripe-signature");
      return new NextResponse("Falta stripe-signature", { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        stripeWebhookSecret
      );
    } catch (error) {
      console.error("STRIPE_WEBHOOK_SIGNATURE_ERROR", error);
      return new NextResponse("Firma inválida", { status: 400 });
    }

    console.log("WEBHOOK EVENT TYPE:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log("SESSION METADATA:", session.metadata);
        console.log("SESSION ID:", session.id);
        console.log("PAYMENT INTENT:", session.payment_intent);

        const invoiceId = String(session.metadata?.invoice_id || "").trim();
        const stripeSessionId = String(session.id || "").trim();
        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id || null;

        if (!invoiceId) {
          console.error("WEBHOOK_MISSING_INVOICE_ID", session.id);
          break;
        }

        const amountTotal = Number(session.amount_total || 0) / 100;
        const customerEmail =
          session.customer_details?.email || session.customer_email || null;
        const currency = String(session.currency || "usd").toUpperCase();

        const { error: updateInvoiceError } = await supabaseAdmin
          .from("invoices")
          .update({
            status: "paid",
            payment_status: "paid",
            paid_at: new Date().toISOString(),
            stripe_session_id: stripeSessionId,
            stripe_payment_intent_id: paymentIntentId,
            payment_email: customerEmail,
            payment_currency: currency,
            payment_amount: amountTotal,
          })
          .eq("id", invoiceId);

        if (updateInvoiceError) {
          console.error("WEBHOOK_UPDATE_INVOICE_ERROR", updateInvoiceError);
          return new NextResponse("Error actualizando factura", {
            status: 500,
          });
        }

        console.log("INVOICE_MARKED_AS_PAID:", invoiceId);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const invoiceId = String(session.metadata?.invoice_id || "").trim();

        console.log("SESSION_EXPIRED_METADATA:", session.metadata);

        if (!invoiceId) break;

        const { error } = await supabaseAdmin
          .from("invoices")
          .update({
            payment_status: "expired",
          })
          .eq("id", invoiceId)
          .neq("status", "paid");

        if (error) {
          console.error("WEBHOOK_EXPIRED_UPDATE_ERROR", error);
          return new NextResponse("Error actualizando sesión expirada", {
            status: 500,
          });
        }

        console.log("INVOICE_MARKED_AS_EXPIRED:", invoiceId);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        console.log("PAYMENT_FAILED_INTENT:", paymentIntent.id);
        console.log("PAYMENT_FAILED_METADATA:", paymentIntent.metadata);

        const { error } = await supabaseAdmin
          .from("invoices")
          .update({
            payment_status: "failed",
          })
          .eq("stripe_payment_intent_id", paymentIntent.id)
          .neq("status", "paid");

        if (error) {
          console.error("WEBHOOK_PAYMENT_FAILED_UPDATE_ERROR", error);
          return new NextResponse("Error actualizando pago fallido", {
            status: 500,
          });
        }

        console.log("INVOICE_MARKED_AS_FAILED_BY_INTENT:", paymentIntent.id);
        break;
      }

      default:
        console.log("UNHANDLED_WEBHOOK_EVENT:", event.type);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("STRIPE_WEBHOOK_ROUTE_ERROR", error);
    return new NextResponse("Error interno del webhook", { status: 500 });
  }
}