import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { invoiceId } = await req.json();

    if (!invoiceId) {
      return NextResponse.json({ error: "Falta invoiceId" }, { status: 400 });
    }

    const { data: invoice, error } = await supabaseAdmin
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .maybeSingle();

    if (error || !invoice) {
      return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tadeoinvoice.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: invoice.client_email || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: (invoice.currency || "usd").toLowerCase(),
            product_data: {
              name: `Factura #${invoice.invoice_number || invoice.id}`,
              description: invoice.client_name || "Invoice payment",
            },
            unit_amount: Math.round(Number(invoice.total || 0) * 100),
          },
        },
      ],
      metadata: {
        invoice_id: invoice.id,
        type: "invoice_payment",
      },
      success_url: `${siteUrl}/public-invoice/${invoice.public_token || invoice.id}?paid=success`,
      cancel_url: `${siteUrl}/public-invoice/${invoice.public_token || invoice.id}?paid=cancelled`,
    });

    await supabaseAdmin
      .from("invoices")
      .update({
        stripe_checkout_session_id: session.id,
      })
      .eq("id", invoice.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("PAY_INVOICE_ERROR", error);
    return NextResponse.json(
      { error: "No se pudo crear el pago" },
      { status: 500 }
    );
  }
}