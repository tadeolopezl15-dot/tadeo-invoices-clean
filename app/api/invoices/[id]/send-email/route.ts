import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await req.json();
    const { to, subject, message } = body;

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

    const { data: invoice, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !invoice) {
      return NextResponse.json(
        { error: "Invoice not found." },
        { status: 404 }
      );
    }

    // 👉 URL del PDF
    const pdfUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/invoices/${id}/pdf`;

    // 👉 Descargar PDF como buffer
    const pdfRes = await fetch(pdfUrl);

    if (!pdfRes.ok) {
      return NextResponse.json(
        { error: "Failed to generate PDF." },
        { status: 500 }
      );
    }

    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());

    // 👉 Enviar email real
    const { error: emailError } = await resend.emails.send({
      from: "Tadeo Invoices <onboarding@resend.dev>",
      to: [to],
      subject: subject || `Invoice ${invoice.invoice_number}`,
      html: `
        <div style="font-family:Arial;padding:20px">
          <h2>Invoice ${invoice.invoice_number}</h2>
          <p>${message || "Please find your invoice attached."}</p>
          <p><strong>Total:</strong> $${invoice.total}</p>
        </div>
      `,
      attachments: [
        {
          filename: `invoice-${invoice.invoice_number}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (emailError) {
      console.error("EMAIL_SEND_ERROR:", emailError);

      return NextResponse.json(
        { error: "Failed to send email." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email sent successfully.",
    });

  } catch (err: any) {
    console.error("SEND_EMAIL_FATAL:", err);

    return NextResponse.json(
      { error: err.message || "Server error sending email." },
      { status: 500 }
    );
  }
}