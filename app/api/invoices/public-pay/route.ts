import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Falta token." }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: invoice, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("public_token", token)
      .single();

    if (error || !invoice) {
      return NextResponse.json({ error: "Factura no encontrada." }, { status: 404 });
    }

    if (invoice.status === "paid") {
      return NextResponse.json({ error: "Esta factura ya está pagada." }, { status: 400 });
    }

    const amount = Math.round(Number(invoice.total || 0) * 100);

    if (!amount || amount < 50) {
      return NextResponse.json(
        { error: "El total de la factura no es válido para cobrar." },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_creation: "always",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: (invoice.currency || "USD").toLowerCase(),
            unit_amount: amount,
            product_data: {
              name: `Invoice ${invoice.invoice_number || invoice.id}`,
              description: invoice.company_name || "Invoice payment",
            },
          },
        },
      ],
      success_url: `${baseUrl}/public-invoice/${invoice.public_token}?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/public-invoice/${invoice.public_token}?canceled=1`,
      metadata: {
        invoice_id: invoice.id,
        public_token: invoice.public_token,
        invoice_number: invoice.invoice_number || "",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("PUBLIC_INVOICE_PAY_ERROR", error);
    return NextResponse.json(
      { error: "No se pudo iniciar el pago." },
      { status: 500 }
    );
  }
}