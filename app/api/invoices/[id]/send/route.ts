import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

// 🔐 Supabase admin (sin RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 🔥 NO crear Resend aquí directamente (rompe build)
function getResend() {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    throw new Error("Missing RESEND_API_KEY");
  }

  return new Resend(key);
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;

    // 🔍 Obtener factura
    const { data: invoice, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (error || !invoice) {
      return NextResponse.json(
        { error: "Factura no encontrada" },
        { status: 404 }
      );
    }

    // 📧 Cliente
    const toEmail = invoice.client_email || invoice.company_email;

    if (!toEmail) {
      return NextResponse.json(
        { error: "No hay email del cliente" },
        { status: 400 }
      );
    }

    // 🔥 Crear instancia solo cuando se usa
    const resend = getResend();

    // ✉️ Enviar email
    await resend.emails.send({
      from: "Tadeo Invoices <onboarding@resend.dev>",
      to: toEmail,
      subject: `Factura #${invoice.invoice_number}`,
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Factura #${invoice.invoice_number}</h2>
          <p>Total: $${invoice.total}</p>
          <p>Gracias por tu negocio.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SEND_EMAIL_ERROR", error);

    return NextResponse.json(
      { error: "Error enviando email" },
      { status: 500 }
    );
  }
}