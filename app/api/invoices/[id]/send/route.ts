import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { Resend } from "resend";

type Params = Promise<{ id: string }>;

type InvoiceRow = {
  id: string;
  invoice_number: string | null;
  client_name: string | null;
  client_email: string | null;
  total: number | null;
  currency: string | null;
  public_token: string | null;
};

type ProfileRow = {
  company_name: string | null;
  company_email: string | null;
  company_phone: string | null;
  company_address: string | null;
  logo_url: string | null;
};

const resend = new Resend(process.env.RESEND_API_KEY);

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(value || 0);
}

function getTranslations(lang: "es" | "en") {
  if (lang === "en") {
    return {
      subjectPrefix: "Invoice",
      hello: "Hello",
      sentYou: "has sent you an invoice for",
      company: "Company",
      invoiceTotal: "Invoice total",
      openInvoice: "Open invoice",
      replyHelp: "If you have any questions, reply directly to this email and your message will go to",
      missingClientEmail: "This invoice does not have a client email",
      notAuthorized: "Unauthorized",
      notFound: "Invoice not found",
      sendError: "Could not send the email",
      pdfName: "invoice",
      clientWord: "client",
    };
  }

  return {
    subjectPrefix: "Factura",
    hello: "Hola",
    sentYou: "te ha enviado una factura por",
    company: "Empresa",
    invoiceTotal: "Total de la factura",
    openInvoice: "Abrir factura",
    replyHelp: "Si tienes alguna pregunta, responde directamente a este correo y tu mensaje llegará a",
    missingClientEmail: "La factura no tiene correo del cliente",
    notAuthorized: "No autorizado",
    notFound: "Factura no encontrada",
    sendError: "No se pudo enviar el email",
    pdfName: "factura",
    clientWord: "cliente",
  };
}

export async function POST(
  _req: Request,
  context: { params: Params }
) {
  try {
    const { id } = await context.params;
    const supabase = await createServerClient();
    const cookieStore = await cookies();
    const lang = cookieStore.get("app_lang")?.value === "en" ? "en" : "es";
    const tr = getTranslations(lang);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: tr.notAuthorized }, { status: 401 });
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("id, invoice_number, client_name, client_email, total, currency, public_token")
      .eq("id", id)
      .eq("user_id", user.id)
      .single<InvoiceRow>();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: tr.notFound }, { status: 404 });
    }

    if (!invoice.client_email) {
      return NextResponse.json(
        { error: tr.missingClientEmail },
        { status: 400 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_name, company_email, company_phone, company_address, logo_url")
      .eq("id", user.id)
      .single<ProfileRow>();

    const companyName = profile?.company_name || "Tadeo Invoices";
    const companyEmail = profile?.company_email || undefined;
    const companyPhone = profile?.company_phone || "";
    const companyAddress = profile?.company_address || "";
    const logoUrl = profile?.logo_url || "";

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const publicUrl = invoice.public_token
      ? `${siteUrl}/public-invoice/${invoice.public_token}`
      : `${siteUrl}/invoice/${invoice.id}`;

    const totalFormatted = money(
      Number(invoice.total || 0),
      invoice.currency || "USD"
    );

    let pdfBase64: string | undefined;

    try {
      const pdfUrl = `${siteUrl}/api/invoices/${invoice.id}/pdf`;
      const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");

      const pdfResponse = await fetch(pdfUrl, {
        method: "GET",
        headers: cookieHeader ? { cookie: cookieHeader } : {},
        cache: "no-store",
      });

      if (pdfResponse.ok) {
        const pdfArrayBuffer = await pdfResponse.arrayBuffer();
        pdfBase64 = Buffer.from(pdfArrayBuffer).toString("base64");
      }
    } catch (pdfError) {
      console.error("ATTACH_PDF_ERROR", pdfError);
    }

    await resend.emails.send({
      from: "Tadeo Invoices <onboarding@resend.dev>",
      to: invoice.client_email,
      replyTo: companyEmail,
      subject: `${tr.subjectPrefix} ${invoice.invoice_number || ""} - ${companyName}`,
      attachments: pdfBase64
        ? [
            {
              filename: `${tr.pdfName}-${invoice.invoice_number || invoice.id}.pdf`,
              content: pdfBase64,
            },
          ]
        : undefined,
      html: `
        <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
          <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
            <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:32px;">
              ${
                logoUrl
                  ? `
                <div style="margin-bottom:20px;">
                  <img src="${logoUrl}" alt="Logo" style="max-height:72px;max-width:180px;object-fit:contain;" />
                </div>
              `
                  : ""
              }

              <h1 style="margin:0 0 8px;font-size:28px;line-height:1.2;color:#0f172a;">
                ${tr.subjectPrefix} ${invoice.invoice_number || ""}
              </h1>

              <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.7;">
                ${tr.hello} ${invoice.client_name || tr.clientWord},<br />
                ${companyName} ${tr.sentYou} <strong>${totalFormatted}</strong>.
              </p>

              <div style="border:1px solid #e2e8f0;border-radius:18px;padding:18px 20px;background:#f8fafc;margin-bottom:24px;">
                <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;">
                  ${tr.company}
                </p>
                <p style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">
                  ${companyName}
                </p>
                ${
                  companyEmail
                    ? `<p style="margin:8px 0 0;color:#475569;font-size:14px;">${companyEmail}</p>`
                    : ""
                }
                ${
                  companyPhone
                    ? `<p style="margin:6px 0 0;color:#475569;font-size:14px;">${companyPhone}</p>`
                    : ""
                }
                ${
                  companyAddress
                    ? `<p style="margin:6px 0 0;color:#475569;font-size:14px;">${companyAddress}</p>`
                    : ""
                }
              </div>

              <div style="border:1px solid #e2e8f0;border-radius:18px;padding:18px 20px;background:#ffffff;margin-bottom:24px;">
                <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;">
                  ${tr.invoiceTotal}
                </p>
                <p style="margin:0;font-size:30px;font-weight:800;color:#0f172a;">
                  ${totalFormatted}
                </p>
              </div>

              <div style="margin:28px 0;">
                <a
                  href="${publicUrl}"
                  style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:16px;font-weight:700;font-size:14px;"
                >
                  ${tr.openInvoice}
                </a>
              </div>

              <p style="margin:0;color:#64748b;font-size:13px;line-height:1.7;">
                ${tr.replyHelp} ${companyName}.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SEND_INVOICE_EMAIL_ERROR", error);
    const cookieStore = await cookies();
    const lang = cookieStore.get("app_lang")?.value === "en" ? "en" : "es";
    const tr = getTranslations(lang);

    return NextResponse.json(
      { error: tr.sendError },
      { status: 500 }
    );
  }
}