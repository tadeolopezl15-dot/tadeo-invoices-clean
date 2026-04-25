import { NextResponse } from "next/server";
import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    throw new Error("Missing RESEND_API_KEY");
  }

  return new Resend(key);
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const resend = getResend();

    await resend.emails.send({
      from: "Tadeo Invoices <onboarding@resend.dev>",
      to: "TU_EMAIL_DE_PRUEBA@gmail.com",
      subject: `Factura ${id}`,
      html: `<p>Factura enviada correctamente.</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SEND_INVOICE_EMAIL_ERROR", error);

    return NextResponse.json(
      { error: "No se pudo enviar el email" },
      { status: 500 }
    );
  }
}