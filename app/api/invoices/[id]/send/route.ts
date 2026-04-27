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
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: invoice, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !invoice) {
      return NextResponse.json(
        { error: "Factura no encontrada" },
        { status: 404 }
      );
    }

    if (!invoice.client_email) {
      return NextResponse.json(
        { error: "La factura no tiene email del cliente" },
        { status: 400 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.tadeoinvoice.com";

    const invoiceUrl = `${siteUrl}/public-invoice/${
      invoice.public_token || invoice.id
    }`;

    const payUrl = `${siteUrl}/api/invoices/${invoice.id}/pay`;
    const pdfUrl = `${siteUrl}/api/invoices/${invoice.id}/pdf`;

    await resend.emails.send({
      from: "Tadeo Invoices <onboarding@resend.dev>",
      to: invoice.client_email,
      subject: `Factura #${invoice.invoice_number || invoice.id}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;padding:24px">
          <h1>Factura #${invoice.invoice_number || invoice.id}</h1>
          <p>Hola ${invoice.client_name || "cliente"},</p>
          <p>Has recibido una factura por:</p>
          <h2>$${Number(invoice.total || 0).toFixed(2)} ${
        invoice.currency || "USD"
      }</h2>

          <p>
            <a href="${invoiceUrl}" style="background:#2563eb;color:white;padding:12px 18px;text-decoration:none;border-radius:10px;display:inline-block">
              Ver factura
            </a>
          </p>

          <p>
            <a href="${payUrl}">Pagar factura</a> · 
            <a href="${pdfUrl}">Descargar PDF</a>
          </p>

          <p style="color:#64748b;font-size:13px">
            Enviado con Tadeo Invoices.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("SEND_INVOICE_ERROR", error);

    return NextResponse.json(
      { error: "No se pudo enviar la factura" },
      { status: 500 }
    );
  }
}