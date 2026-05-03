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

    if (!to) {
      return NextResponse.json(
        { error: "Client email is required." },
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
        {
          error: invoiceError?.message || "Invoice not found.",
          details: invoiceError,
        },
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

    const trackingPixelUrl = `${siteUrl}/api/invoices/${invoice.id}/track-open`;

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
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Invoice ${invoiceNumber}</title>
        </head>

        <body style="margin:0;padding:0;background:#f6f9fc;font-family:Arial,Helvetica,sans-serif;">
          <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
            Invoice ${invoiceNumber} is ready. Amount due: ${total}.
          </div>

          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f9fc;padding:40px 16px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e6ebf1;">
                  <tr>
                    <td style="padding:32px 36px;background:#050816;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <div style="font-size:22px;font-weight:900;color:#ffffff;">
                              Tadeo Invoices
                            </div>
                            <div style="font-size:13px;color:#94a3b8;margin-top:4px;">
                              Secure billing and payments
                            </div>
                          </td>

                          <td align="right">
                            <span style="display:inline-block;padding:8px 14px;border-radius:999px;background:#2563eb;color:#ffffff;font-size:12px;font-weight:800;text-transform:uppercase;">
                              ${invoice.status || "pending"}
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:38px 36px 20px;">
                      <div style="font-size:13px;font-weight:900;color:#2563eb;text-transform:uppercase;letter-spacing:1.8px;">
                        Invoice ready
                      </div>

                      <h1 style="margin:14px 0 0;font-size:34px;line-height:1.15;color:#0f172a;letter-spacing:-1px;">
                        Invoice ${invoiceNumber}
                      </h1>

                      <p style="margin:18px 0 0;color:#475569;font-size:15px;line-height:1.7;">
                        ${
                          message
                            ? message.replace(/\n/g, "<br />")
                            : "Your invoice is ready. You can review it online, download it, or pay securely using the link below."
                        }
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:10px 36px 0;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:20px;">
                        <tr>
                          <td style="padding:24px;">
                            <div style="font-size:13px;color:#64748b;font-weight:700;">
                              Client
                            </div>
                            <div style="margin-top:6px;font-size:17px;color:#0f172a;font-weight:900;">
                              ${invoice.company_name || "Client"}
                            </div>
                            <div style="margin-top:4px;font-size:14px;color:#64748b;">
                              ${invoice.company_email || ""}
                            </div>
                          </td>

                          <td align="right" style="padding:24px;">
                            <div style="font-size:13px;color:#64748b;font-weight:700;">
                              Amount Due
                            </div>
                            <div style="margin-top:6px;font-size:34px;color:#0f172a;font-weight:900;letter-spacing:-0.8px;">
                              ${total}
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:30px 36px;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <a href="${payLink}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:15px 22px;border-radius:14px;font-size:15px;font-weight:900;">
                              Pay invoice
                            </a>
                          </td>

                          <td style="width:12px;"></td>

                          <td>
                            <a href="${publicLink}" style="display:inline-block;background:#ffffff;color:#0f172a;text-decoration:none;padding:14px 21px;border-radius:14px;font-size:15px;font-weight:900;border:1px solid #cbd5e1;">
                              View invoice
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#64748b;">
                        Secure invoice link:
                      </p>

                      <p style="margin:6px 0 0;font-size:12px;line-height:1.6;color:#2563eb;word-break:break-all;">
                        ${publicLink}
                      </p>

                      <p style="margin:28px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">
                        ${
                          attachments
                            ? "A PDF copy of this invoice is attached."
                            : "You can view or download the invoice using the secure link above."
                        }
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:24px 36px;background:#f8fafc;border-top:1px solid #e6ebf1;">
                      <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
                        Sent by Tadeo Invoices. This message contains a secure invoice link for payment and review.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <img
            src="${trackingPixelUrl}"
            width="1"
            height="1"
            alt=""
            style="display:none;width:1px;height:1px;opacity:0;border:0;"
          />
        </body>
      </html>
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
        {
          error: error.message || "Resend failed.",
          details: error,
        },
        { status: 500 }
      );
    }

    await supabase
      .from("invoices")
      .update({
        status: "sent",
        email_sent_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json({
      ok: true,
      data,
      pdfAttached: Boolean(attachments),
      trackingEnabled: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Error sending invoice email.",
        details: error,
      },
      { status: 500 }
    );
  }
}