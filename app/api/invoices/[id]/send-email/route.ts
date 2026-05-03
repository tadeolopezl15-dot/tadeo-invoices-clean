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

function escapeHtml(value: string) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Missing RESEND_API_KEY." },
        { status: 500 }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Missing SUPABASE_SERVICE_ROLE_KEY." },
        { status: 500 }
      );
    }

    const body = await req.json();

    const to = String(body.to || "").trim();
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();

    if (!to) {
      return NextResponse.json(
        { error: "Missing recipient email." },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: "Invoice not found." },
        { status: 404 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

    const publicUrl = invoice.public_token
      ? `${siteUrl}/public-invoice/${invoice.public_token}`
      : `${siteUrl}/invoice/${invoice.id}`;

    const payUrl = `${siteUrl}/api/invoices/${invoice.id}/pay`;
    const pdfUrl = `${siteUrl}/api/invoices/${invoice.id}/pdf`;

    const pdfResponse = await fetch(pdfUrl, {
      cache: "no-store",
    });

    if (!pdfResponse.ok) {
      const text = await pdfResponse.text();

      console.error("PDF_GENERATION_ERROR:", text);

      return NextResponse.json(
        { error: "Failed to generate PDF attachment." },
        { status: 500 }
      );
    }

    const pdfBase64 = Buffer.from(await pdfResponse.arrayBuffer()).toString(
      "base64"
    );

    const invoiceNumber = invoice.invoice_number || invoice.id.slice(0, 8);
    const currency = invoice.currency || "USD";
    const total = money(Number(invoice.total || 0), currency);

    const safeMessage = escapeHtml(
      message || "Please find your invoice attached."
    ).replaceAll("\n", "<br />");

    const html = `
      <!doctype html>
      <html>
        <body style="margin:0;padding:0;background:#020617;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
          <div style="max-width:680px;margin:0 auto;padding:32px 18px;">
            <div style="border:1px solid rgba(255,255,255,.12);border-radius:28px;background:linear-gradient(135deg,#0f172a,#020617);overflow:hidden;">
              <div style="padding:34px 30px;border-bottom:1px solid rgba(255,255,255,.1);">
                <div style="font-size:12px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#67e8f9;">
                  Tadeo Invoices
                </div>

                <h1 style="margin:16px 0 0;font-size:32px;line-height:1.1;color:#ffffff;">
                  Invoice ${escapeHtml(invoiceNumber)}
                </h1>

                <p style="margin:12px 0 0;color:#94a3b8;font-size:15px;line-height:1.6;">
                  A professional invoice has been shared with you. You can review it online, download the PDF, or pay securely.
                </p>
              </div>

              <div style="padding:30px;">
                <div style="border-radius:22px;background:rgba(15,23,42,.9);border:1px solid rgba(255,255,255,.1);padding:24px;">
                  <p style="margin:0;color:#94a3b8;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">
                    Amount Due
                  </p>

                  <div style="margin-top:8px;font-size:40px;font-weight:900;color:#67e8f9;">
                    ${total}
                  </div>

                  <div style="margin-top:18px;color:#cbd5e1;font-size:15px;line-height:1.7;">
                    ${safeMessage}
                  </div>
                </div>

                <div style="margin-top:24px;display:block;">
                  <a href="${payUrl}" style="display:block;text-align:center;background:#22d3ee;color:#020617;text-decoration:none;font-weight:900;border-radius:16px;padding:16px 20px;">
                    Pay Invoice Securely
                  </a>

                  <a href="${publicUrl}" style="display:block;text-align:center;margin-top:12px;border:1px solid rgba(255,255,255,.16);color:#ffffff;text-decoration:none;font-weight:800;border-radius:16px;padding:15px 20px;">
                    View Invoice Online
                  </a>
                </div>

                <div style="margin-top:24px;border-radius:20px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);padding:18px;">
                  <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;">
                    A PDF copy of this invoice is attached to this email. Secure payment is powered by Stripe.
                  </p>
                </div>
              </div>

              <div style="padding:22px 30px;border-top:1px solid rgba(255,255,255,.1);color:#64748b;font-size:12px;line-height:1.6;">
                Sent by Tadeo Invoices · Professional billing and payments.
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Invoice ${invoiceNumber}

Amount Due: ${total}

${message || "Please find your invoice attached."}

Pay Invoice:
${payUrl}

View Invoice:
${publicUrl}

A PDF copy is attached.
`;

    const { data: emailData, error: emailError } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "Tadeo Invoices <onboarding@resend.dev>",
      to: [to],
      subject: subject || `Invoice ${invoiceNumber} from Tadeo Invoices`,
      html,
      text,
      attachments: [
        {
          filename: `invoice-${invoiceNumber}.pdf`,
          content: pdfBase64,
        },
      ],
      tags: [
        {
          name: "type",
          value: "invoice",
        },
        {
          name: "invoice_id",
          value: String(invoice.id).replaceAll("-", "_").slice(0, 256),
        },
      ],
    });

    if (emailError) {
      console.error("RESEND_EMAIL_ERROR:", emailError);

      return NextResponse.json(
        {
          error:
            typeof emailError === "object" && "message" in emailError
              ? String(emailError.message)
              : "Failed to send email.",
        },
        { status: 500 }
      );
    }

    await supabase
      .from("invoices")
      .update({
        status: invoice.status === "paid" ? "paid" : "sent",
      })
      .eq("id", id);

    return NextResponse.json({
      ok: true,
      message: "Email sent successfully with PDF attached.",
      data: emailData,
    });
  } catch (err: any) {
    console.error("SEND_EMAIL_FATAL:", err);

    return NextResponse.json(
      {
        error: err?.message || "Server error sending invoice email.",
      },
      { status: 500 }
    );
  }
}