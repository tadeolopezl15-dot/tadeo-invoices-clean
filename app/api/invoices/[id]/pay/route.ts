import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{ id: string }>;
};

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Falta STRIPE_SECRET_KEY en .env.local");
}

const stripe = new Stripe(stripeSecretKey);

export async function POST(_request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;

    const supabase = await createServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: "Factura no encontrada" },
        { status: 404 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      "http://localhost:3000";

    const invoiceNumber =
      invoice.invoice_number ||
      invoice.number ||
      `INV-${String(invoice.id).slice(0, 8).toUpperCase()}`;

    const currency = String(invoice.currency || "USD").toLowerCase();
    const total = Number(invoice.total || 0);

    if (!Number.isFinite(total) || total <= 0) {
      return NextResponse.json(
        { error: "La factura no tiene un total válido para cobrar" },
        { status: 400 }
      );
    }

    const unitAmount = Math.round(total * 100);

    const customerEmail =
      invoice.client_email ||
      invoice.customer_email ||
      invoice.email ||
      undefined;

    const clientName =
      invoice.client_name || invoice.client || invoice.customer_name || "Client";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${siteUrl}/invoice/${invoice.id}?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/invoice/${invoice.id}?canceled=1`,
      customer_email: customerEmail,
      metadata: {
        invoice_id: String(invoice.id),
        user_id: String(user.id),
        invoice_number: String(invoiceNumber),
      },
      payment_intent_data: {
        metadata: {
          invoice_id: String(invoice.id),
          user_id: String(user.id),
          invoice_number: String(invoiceNumber),
        },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: unitAmount,
            product_data: {
              name: `Invoice ${invoiceNumber}`,
              description: `Payment for invoice ${invoiceNumber} - ${clientName}`,
            },
          },
        },
      ],
    });

    const { error: paymentLinkError } = await supabase
      .from("invoices")
      .update({
        payment_url: session.url,
        stripe_session_id: session.id,
        payment_status: "pending",
      })
      .eq("id", invoice.id)
      .eq("user_id", user.id);

    if (paymentLinkError) {
      console.error("SAVE_PAYMENT_LINK_ERROR", paymentLinkError);
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("CREATE_INVOICE_PAYMENT_SESSION_ERROR", error);
    return NextResponse.json(
      { error: "No se pudo crear la sesión de pago" },
      { status: 500 }
    );
  }
}