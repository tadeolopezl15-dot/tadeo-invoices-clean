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
    const body = await req.json().catch(() => ({}));

    const to = String(body.to || "").trim();
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Missing RESEND_API_KEY." }, { status: 500 });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY." }, { status: 500 });
    }

    if (!to) {
      return NextResponse.json({ error: "Client email is required." }, { status: 400 });
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
        { error: invoiceError?.message || "Invoice not found.", details: invoiceError },
        { status: 404 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

    const publicLink = invoice.public_token
      ? `${siteUrl}/public-invoice/${invoice.public_token}`
      : `${siteUrl}/invoice/${invoice.id}`;

    const payLink = invoice.public_token
      ? `${siteUrl}/public-invoice/${invoice.public_token}/pay`
      : `${siteUrl}/api/invoices/${invoice.id}/pay`;

    const invoiceNumber = invoice.invoice_number || `INV-${invoice.id}`;
    const total = money(Number(invoice.total || 0), invoice.currency || "USD");

    let attachments:
      | {
          filename: string;
          content: string;
        }[]
      | undefined;

    try {
      const pdfUrl = `${siteUrl}/api/invoices/${invoice.id}/pdf`;
      const pdfResponse = await fetch(pdfUrl, { cache: "no-store" });

      if (pdfResponse.ok) {
        const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
        attachments = [
          {
            filename: `Invoice-${invoice.invoice_number || invoice.id}.pdf`,
            content: pdfBuffer.toString("base64"),
          },
        ];
      } else {
        console.warn("PDF_SKIPPED:", await pdfResponse.text());
      }
    } catch (pdfError) {
      console.warn("PDF_ATTACHMENT_SKIPPED:", pdfError);
    }

    const html = `
      <div style="margin:0;padding:0;background:#f6f9fc;font-family:Arial,sans-serif;">
        <div style="max-width:680px;margin:0 auto;padding:40px 16px;">
          <div style="background:#050816;border-radius:24px 24px 0 0;padding:32px;">
            <h1 style="margin:0;color:white;font-size:24px;">Tadeo Invoices</h1>
            <p style="margin:6px 0 0;color:#94a3b8;">Secure billing and payments</p>
          </div>

          <div style="background:white;border:1px solid #e5e7eb;border-top:0;padding:36px;border-radius:0 0 24px 24px;">
            <p style="margin:0;color:#2563eb;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;font-size:12px;">
              Invoice ready
            </p>

            <h2 style="margin:14px 0 0;color:#0f172a;font-size:32px;">
              Invoice ${invoiceNumber}
            </h2>

            <p style="margin:18px 0 0;color:#475569;font-size:15px;line-height:1.7;">
              ${
                message
                  ? message.replace(/\n/g, "<br />")
                  : "Your invoice is ready. You can review it online or pay securely using the link below."
              }
            </p>

            <div style="margin:26px 0;padding:22px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;">
              <p style="margin:0;color:#64748b;font-size:13px;font-weight:700;">Client</p>
              <p style="margin:6px 0 0;color:#0f172a;font-size:17px;font-weight:900;">
                ${invoice.company_name || "Client"}
              </p>
              <p style="margin:4px 0 0;color:#64748b;font-size:14px;">
                ${invoice.company_email || ""}
              </p>

              <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;" />

              <p style="margin:0;color:#64748b;font-size:13px;font-weight:700;">Amount Due</p>
              <p style="margin:6px 0 0;color:#0f172a;font-size:34px;font-weight:900;">
                ${total}
              </p>
            </div>

            <a href="${payLink}" style="display:inline-block;background:#2563eb;color:white;text-decoration:none;padding:15px 22px;border-radius:14px;font-weight:900;">
              Pay invoice
            </a>

            <a href="${publicLink}" style="display:inline-block;margin-left:10px;background:white;color:#0f172a;text-decoration:none;padding:14px 21px;border-radius:14px;font-weight:900;border:1px solid #cbd5e1;">
              View invoice
            </a>

            <p style="margin:26px 0 0;color:#64748b;font-size:13px;">Secure invoice link:</p>
            <p style="margin:6px 0 0;color:#2563eb;font-size:12px;word-break:break-all;">
              ${publicLink}
            </p>
          </div>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "Tadeo Invoices <onboarding@resend.dev>",
      to: [to],
      subject: subject || `Invoice ${invoiceNumber}`,
      html,
      attachments,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Resend failed.", details: error },
        { status: 500 }
      );
    }

    await supabase.from("invoices").update({ status: "sent" }).eq("id", id);

    return NextResponse.json({ ok: true, data, pdfAttached: Boolean(attachments) });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Error sending invoice email.", details: error },
      { status: 500 }
    );
  }
}