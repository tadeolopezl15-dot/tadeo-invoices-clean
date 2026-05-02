import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(value || 0));
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const to = String(body.to || "").trim();
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();

    if (!to) {
      return NextResponse.json({ error: "Falta el email del cliente." }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: "Factura no encontrada." }, { status: 404 });
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

    const pdfUrl = `${siteUrl}/api/invoices/${id}/pdf`;

    const pdfResponse = await fetch(pdfUrl, {
      cache: "no-store",
    });

    if (!pdfResponse.ok) {
      return NextResponse.json(
        { error: "No se pudo generar el PDF para adjuntar." },
        { status: 500 }
      );
    }

    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
    const pdfBase64 = pdfBuffer.toString("base64");

    const publicLink = invoice.public_token
      ? `${siteUrl}/public-invoice/${invoice.public_token}`
      : `${siteUrl}/invoice/${invoice.id}`;

    const html = `
      <div style="font-family: Arial, sans-serif; background:#f8fafc; padding:32px;">
        <div style="max-width:640px; margin:auto; background:#ffffff; border-radius:18px; padding:32px; border:1px solid #e5e7eb;">
          <h1 style="margin:0; color:#0f172a;">Factura ${invoice.invoice_number || ""}</h1>
          <p style="color:#475569; font-size:15px; line-height:1.6;">
            ${message.replace(/\n/g, "<br />")}
          </p>

          <div style="margin:24px 0; padding:18px; background:#f1f5f9; border-radius:14px;">
            <p style="margin:0; color:#64748b;">Total</p>
            <p style="margin:6px 0 0; font-size:28px; font-weight:800; color:#0f172a;">
              ${money(invoice.total, invoice.currency || "USD")}
            </p>
          </div>

          <a href="${publicLink}" style="display:inline-block; background:#06b6d4; color:#020617; font-weight:800; text-decoration:none; padding:14px 20px; border-radius:14px;">
            Ver factura online
          </a>

          <p style="margin-top:28px; color:#94a3b8; font-size:12px;">
            También adjuntamos el PDF de la factura en este email.
          </p>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "Tadeo Invoices <onboarding@resend.dev>",
      to: [to],
      subject: subject || `Factura ${invoice.invoice_number || ""}`,
      html,
      attachments: [
        {
          filename: `Factura-${invoice.invoice_number || invoice.id}.pdf`,
          content: pdfBase64,
        },
      ],
    });

    if (error) {
      console.error("RESEND_ERROR", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    await supabase
      .from("invoices")
      .update({ status: "sent" })
      .eq("id", id);

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error: any) {
    console.error("SEND_INVOICE_EMAIL_ERROR", error);
    return NextResponse.json(
      { error: error?.message || "Error enviando email." },
      { status: 500 }
    );
  }
}