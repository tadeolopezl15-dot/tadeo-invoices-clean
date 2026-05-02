import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: invoice, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !invoice) {
      return NextResponse.json({ error: "Factura no encontrada." }, { status: 404 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
    const amount = Math.round(Number(invoice.total || 0) * 100);

    if (amount < 50) {
      return NextResponse.json(
        { error: "El total de la factura debe ser mínimo $0.50." },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: invoice.client_email || undefined,
      client_reference_id: invoice.id,
      metadata: {
        invoice_id: invoice.id,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: String(invoice.currency || "usd").toLowerCase(),
            unit_amount: amount,
            product_data: {
              name: `Factura ${invoice.invoice_number || invoice.id}`,
              description: invoice.company_name || "Tadeo Invoices",
            },
          },
        },
      ],
      success_url: `${siteUrl}/invoice/${invoice.id}?paid=success`,
      cancel_url: `${siteUrl}/invoice/${invoice.id}?paid=cancel`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe no devolvió URL de pago." }, { status: 500 });
    }

    return NextResponse.redirect(session.url);
  } catch (err: any) {
    console.error("STRIPE_PAY_ERROR", err);
    return NextResponse.json(
      { error: err?.message || "Error creando pago." },
      { status: 500 }
    );
  }
}