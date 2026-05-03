import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Missing RESEND_API_KEY in Vercel." },
        { status: 500 }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Missing SUPABASE_SERVICE_ROLE_KEY in Vercel." },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const body = await req.json();

    const to = String(body.to || "").trim();
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();

    if (!to) {
      return NextResponse.json(
        { error: "Enter the client email." },
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
        { error: "Invoice not found in Supabase." },
        { status: 404 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

    const invoiceNumber = invoice.invoice_number || invoice.id.slice(0, 8);
    const currency = invoice.currency || "USD";
    const total = money(Number(invoice.total || 0), currency);

    const pdfUrl = `${siteUrl}/api/invoices/${invoice.id}/pdf`;
    const payUrl = `${siteUrl}/api/invoices/${invoice.id}/pay`;
    const publicUrl = invoice.public_token
      ? `${siteUrl}/public-invoice/${invoice.public_token}`
      : `${siteUrl}/invoice/${invoice.id}`;

    const pdfResponse = await fetch(pdfUrl, {
      cache: "no-store",
    });

    if (!pdfResponse.ok) {
      const text = await pdfResponse.text();

      console.error("PDF_ATTACHMENT_ERROR:", text);

      return NextResponse.json(
        { error: "The PDF could not be generated for attachment." },
        { status: 500 }
      );
    }

    const pdfBase64 = Buffer.from(await pdfResponse.arrayBuffer()).toString(
      "base64"
    );

    const from =
      process.env.RESEND_FROM_EMAIL ||
      "Tadeo Invoices <onboarding@resend.dev>";

    const html = `
      <div style="margin:0;padding:0;background:#020617;font-family:Arial,Helvetica,sans-serif;color:#fff;">
        <div style="max-width:680px;margin:0 auto;padding:32px 18px;">
          <div style="border:1px solid rgba(255,255,255,.12);border-radius:28px;background:#0f172a;overflow:hidden;">
            <div style="padding:32px;border-bottom:1px solid rgba(255,255,255,.1);">
              <p style="margin:0;color:#67e8f9;font-size:12px;font-weight:900;letter-spacing:3px;text-transform:uppercase;">
                Tadeo Invoices
              </p>
              <h1 style="margin:14px 0 0;font-size:32px;line-height:1.1;color:#ffffff;">
                Invoice ${invoiceNumber}
              </h1>
              <p style="margin:12px 0 0;color:#94a3b8;font-size:15px;line-height:1.6;">
                A professional invoice has been shared with you.
              </p>
            </div>

            <div style="padding:32px;">
              <div style="border-radius:22px;background:#020617;border:1px solid rgba(255,255,255,.1);padding:24px;">
                <p style="margin:0;color:#94a3b8;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;">
                  Amount Due
                </p>
                <div style="margin-top:8px;font-size:40px;font-weight:900;color:#67e8f9;">
                  ${total}
                </div>
                <p style="margin-top:18px;color:#cbd5e1;font-size:15px;line-height:1.7;">
                  ${(message || "Please find your invoice attached.").replace(/\n/g, "<br />")}
                </p>
              </div>

              <a href="${payUrl}" style="display:block;margin-top:24px;text-align:center;background:#22d3ee;color:#020617;text-decoration:none;font-weight:900;border-radius:16px;padding:16px 20px;">
                Pay Invoice Securely
              </a>

              <a href="${publicUrl}" style="display:block;margin-top:12px;text-align:center;border:1px solid rgba(255,255,255,.16);color:#ffffff;text-decoration:none;font-weight:800;border-radius:16px;padding:15px 20px;">
                View Invoice Online
              </a>

              <p style="margin-top:24px;color:#94a3b8;font-size:12px;line-height:1.6;">
                A PDF copy of this invoice is attached to this email.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject: subject || `Invoice ${invoiceNumber} from Tadeo Invoices`,
      html,
      text: `
Invoice ${invoiceNumber}

Amount Due: ${total}

${message || "Please find your invoice attached."}

Pay Invoice:
${payUrl}

View Invoice:
${publicUrl}
      `,
      attachments: [
        {
          filename: `invoice-${invoiceNumber}.pdf`,
          content: pdfBase64,
        },
      ],
    });

    if (error) {
      console.error("RESEND_SEND_ERROR:", error);

      return NextResponse.json(
        {
          error:
            typeof error === "object" && "message" in error
              ? String(error.message)
              : "Resend could not send this email.",
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
      message: "Email sent successfully.",
      data,
    });
  } catch (err: any) {
    console.error("SEND_EMAIL_FATAL:", err);

    return NextResponse.json(
      { error: err?.message || "Server error sending email." },
      { status: 500 }
    );
  }
}