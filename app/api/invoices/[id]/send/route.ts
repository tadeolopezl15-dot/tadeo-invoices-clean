import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { Resend } from "resend";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: invoice, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    if (!invoice.client_email) {
      return NextResponse.json(
        { error: "This invoice does not have a client email" },
        { status: 400 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.tadeoinvoice.com";

    const publicUrl = invoice.public_token
      ? `${siteUrl}/public-invoice/${invoice.public_token}`
      : `${siteUrl}/invoice/${invoice.id}`;

    const payUrl = `${siteUrl}/api/invoices/${invoice.id}/pay`;
    const pdfUrl = `${siteUrl}/api/invoices/${invoice.id}/pdf?lang=en`;

    const total = Number(invoice.total || 0).toFixed(2);
    const currency = invoice.currency || "USD";

    await resend.emails.send({
      from: "Tadeo Invoices <facturas@tadeoinvoice.com>",
      to: invoice.client_email,
      subject: `Invoice #${invoice.invoice_number || invoice.id}`,
      html: `
        <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
          <div style="max-width:680px;margin:0 auto;padding:32px 20px;">
            <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;box-shadow:0 20px 50px rgba(15,23,42,.08);">
              
              <div style="background:linear-gradient(135deg,#0f172a,#2563eb);padding:32px;color:white;">
                <div style="font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;opacity:.85;">
                  Tadeo Invoices
                </div>
                <h1 style="margin:12px 0 0;font-size:32px;line-height:1.1;">
                  Your invoice is ready
                </h1>
                <p style="margin:10px 0 0;color:#dbeafe;font-size:15px;">
                  Invoice #${invoice.invoice_number || invoice.id}
                </p>
              </div>

              <div style="padding:32px;">
                <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">
                  Hi ${invoice.client_name || "there"},
                </p>

                <p style="font-size:16px;line-height:1.6;margin:0 0 24px;color:#475569;">
                  You have received a new invoice. You can review it, download the PDF, or pay it securely online.
                </p>

                <div style="background:#f1f5f9;border-radius:20px;padding:24px;margin:24px 0;">
                  <div style="font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;">
                    Amount due
                  </div>
                  <div style="font-size:36px;font-weight:900;color:#0f172a;margin-top:6px;">
                    $${total} ${currency}
                  </div>
                </div>

                <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:28px;">
                  <a href="${payUrl}" style="background:#2563eb;color:white;text-decoration:none;border-radius:14px;padding:14px 20px;font-weight:800;display:inline-block;">
                    Pay invoice
                  </a>

                  <a href="${pdfUrl}" style="background:#0f172a;color:white;text-decoration:none;border-radius:14px;padding:14px 20px;font-weight:800;display:inline-block;">
                    Download PDF
                  </a>

                  <a href="${publicUrl}" style="background:#ffffff;color:#0f172a;text-decoration:none;border:1px solid #cbd5e1;border-radius:14px;padding:14px 20px;font-weight:800;display:inline-block;">
                    View invoice
                  </a>
                </div>

                <p style="font-size:13px;color:#64748b;margin-top:30px;line-height:1.6;">
                  If you have any questions about this invoice, please contact the sender directly.
                </p>
              </div>

              <div style="border-top:1px solid #e2e8f0;padding:20px 32px;background:#f8fafc;color:#64748b;font-size:12px;">
                Sent securely with Tadeo Invoices.
              </div>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("SEND_INVOICE_ERROR", error);

    return NextResponse.json(
      { error: "Could not send invoice email" },
      { status: 500 }
    );
  }
}