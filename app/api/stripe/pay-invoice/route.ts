// app/api/stripe/pay-invoice/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

function toCents(value: number) {
  return Math.round(value * 100);
}

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Falta token" }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from("invoices")
      .select(`
        id,
        number,
        total,
        currency,
        user_id,
        client_name,
        client_email,
        payment_status,
        public_token,
        profiles:user_id (
          stripe_account_id,
          stripe_charges_enabled,
          stripe_payouts_enabled,
          platform_fee_percent
        )
      `)
      .eq("public_token", token)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
    }

    if (invoice.payment_status === "paid") {
      return NextResponse.json({ error: "La factura ya fue pagada" }, { status: 400 });
    }

    const profile = Array.isArray(invoice.profiles) ? invoice.profiles[0] : invoice.profiles;

    if (!profile?.stripe_account_id) {
      return NextResponse.json(
        { error: "El miembro no tiene cuenta Stripe conectada" },
        { status: 400 }
      );
    }

    if (!profile.stripe_charges_enabled) {
      return NextResponse.json(
        { error: "La cuenta Stripe del miembro aún no puede cobrar" },
        { status: 400 }
      );
    }

    const amount = toCents(Number(invoice.total || 0));
    if (!amount || amount < 50) {
      return NextResponse.json(
        { error: "El total de la factura no es válido" },
        { status: 400 }
      );
    }

    const feePercent = Number(profile.platform_fee_percent || 2.5);
    const applicationFeeAmount = Math.round(amount * (feePercent / 100));

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: (invoice.currency || "usd").toLowerCase(),
      application_fee_amount: applicationFeeAmount,
      transfer_data: {
        destination: profile.stripe_account_id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: invoice.client_email || undefined,
      metadata: {
        invoice_id: String(invoice.id),
        invoice_number: String(invoice.number ?? ""),
        member_user_id: String(invoice.user_id),
        fee_percent: String(feePercent),
        public_token: String(invoice.public_token ?? ""),
      },
    });

    const { error: updateError } = await supabaseAdmin
      .from("invoices")
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        payment_status: "processing",
      })
      .eq("id", invoice.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Se creó el pago, pero no se pudo guardar en la factura" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      invoice: {
        id: invoice.id,
        number: invoice.number,
        total: invoice.total,
        currency: invoice.currency || "usd",
        client_name: invoice.client_name || "",
        client_email: invoice.client_email || "",
      },
    });
  } catch (error) {
    console.error("PAY_INVOICE_ERROR", error);
    return NextResponse.json(
      { error: "No se pudo iniciar el pago de la factura" },
      { status: 500 }
    );
  }
}