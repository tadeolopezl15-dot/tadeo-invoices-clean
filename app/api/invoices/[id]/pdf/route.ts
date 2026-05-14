import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(value || 0));
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const { data: items } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id);

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

    const payUrl = `${siteUrl}/api/invoices/${invoice.id}/pay`;

    const qrPngDataUrl = await QRCode.toDataURL(payUrl, {
      width: 300,
      margin: 1,
    });

    const qrPngBytes = Buffer.from(
      qrPngDataUrl.replace(/^data:image\/png;base64,/, ""),
      "base64"
    );

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const qrImage = await pdfDoc.embedPng(qrPngBytes);

    const { width, height } = page.getSize();

    page.drawRectangle({
      x: 0,
      y: height - 120,
      width,
      height: 120,
      color: rgb(0.02, 0.04, 0.12),
    });

    page.drawText("Tadeo Invoices", {
      x: 50,
      y: height - 55,
      size: 22,
      font: bold,
      color: rgb(1, 1, 1),
    });

    page.drawText("Professional Billing & Payments", {
      x: 50,
      y: height - 78,
      size: 10,
      font,
      color: rgb(0.65, 0.75, 0.9),
    });

    page.drawText(`Invoice #${invoice.invoice_number || invoice.id.slice(0, 8)}`, {
      x: 50,
      y: height - 165,
      size: 28,
      font: bold,
      color: rgb(0.02, 0.04, 0.12),
    });

    page.drawText(`Client: ${invoice.client_name || "Unknown Client"}`, {
      x: 50,
      y: height - 200,
      size: 12,
      font,
      color: rgb(0.2, 0.25, 0.35),
    });

    page.drawText(`Email: ${invoice.client_email || "No email"}`, {
      x: 50,
      y: height - 220,
      size: 12,
      font,
      color: rgb(0.2, 0.25, 0.35),
    });

    page.drawText(`Issue Date: ${invoice.issue_date || "—"}`, {
      x: 50,
      y: height - 250,
      size: 11,
      font,
      color: rgb(0.3, 0.35, 0.45),
    });

    page.drawText(`Due Date: ${invoice.due_date || "—"}`, {
      x: 50,
      y: height - 268,
      size: 11,
      font,
      color: rgb(0.3, 0.35, 0.45),
    });

    page.drawText("Scan to Pay", {
      x: 455,
      y: height - 165,
      size: 14,
      font: bold,
      color: rgb(0.02, 0.04, 0.12),
    });

    page.drawImage(qrImage, {
      x: 445,
      y: height - 305,
      width: 115,
      height: 115,
    });

    page.drawText("Secure Stripe payment", {
      x: 445,
      y: height - 320,
      size: 8,
      font,
      color: rgb(0.35, 0.4, 0.5),
    });

    page.drawText("Description", {
      x: 50,
      y: height - 350,
      size: 11,
      font: bold,
      color: rgb(0.1, 0.15, 0.25),
    });

    page.drawText("Qty", {
      x: 340,
      y: height - 350,
      size: 11,
      font: bold,
      color: rgb(0.1, 0.15, 0.25),
    });

    page.drawText("Price", {
      x: 400,
      y: height - 350,
      size: 11,
      font: bold,
      color: rgb(0.1, 0.15, 0.25),
    });

    page.drawText("Total", {
      x: 490,
      y: height - 350,
      size: 11,
      font: bold,
      color: rgb(0.1, 0.15, 0.25),
    });

    page.drawLine({
      start: { x: 50, y: height - 365 },
      end: { x: 560, y: height - 365 },
      thickness: 1,
      color: rgb(0.85, 0.88, 0.92),
    });

    let y = height - 390;

    for (const item of items || []) {
      const qty = Number(item.quantity ?? item.qty ?? 0);
      const price = Number(item.unit_price ?? item.price ?? 0);
      const lineTotal = Number(item.line_total ?? qty * price);

      page.drawText(String(item.description || "Service").slice(0, 42), {
        x: 50,
        y,
        size: 10,
        font,
        color: rgb(0.15, 0.2, 0.3),
      });

      page.drawText(String(qty), {
        x: 345,
        y,
        size: 10,
        font,
        color: rgb(0.15, 0.2, 0.3),
      });

      page.drawText(money(price, invoice.currency || "USD"), {
        x: 400,
        y,
        size: 10,
        font,
        color: rgb(0.15, 0.2, 0.3),
      });

      page.drawText(money(lineTotal, invoice.currency || "USD"), {
        x: 490,
        y,
        size: 10,
        font: bold,
        color: rgb(0.15, 0.2, 0.3),
      });

      y -= 24;
    }

    page.drawLine({
      start: { x: 360, y: 180 },
      end: { x: 560, y: 180 },
      thickness: 1,
      color: rgb(0.85, 0.88, 0.92),
    });

    page.drawText("Subtotal", {
      x: 380,
      y: 150,
      size: 11,
      font,
      color: rgb(0.25, 0.3, 0.4),
    });

    page.drawText(money(Number(invoice.subtotal || 0), invoice.currency || "USD"), {
      x: 480,
      y: 150,
      size: 11,
      font: bold,
      color: rgb(0.1, 0.15, 0.25),
    });

    page.drawText("Tax", {
      x: 380,
      y: 125,
      size: 11,
      font,
      color: rgb(0.25, 0.3, 0.4),
    });

    page.drawText(money(Number(invoice.tax_total || 0), invoice.currency || "USD"), {
      x: 480,
      y: 125,
      size: 11,
      font: bold,
      color: rgb(0.1, 0.15, 0.25),
    });

    page.drawText("Total", {
      x: 380,
      y: 90,
      size: 16,
      font: bold,
      color: rgb(0.02, 0.04, 0.12),
    });

    page.drawText(money(Number(invoice.total || 0), invoice.currency || "USD"), {
      x: 455,
      y: 90,
      size: 18,
      font: bold,
      color: rgb(0.02, 0.55, 0.65),
    });

    page.drawText(`Payment link: ${payUrl}`, {
      x: 50,
      y: 50,
      size: 8,
      font,
      color: rgb(0.35, 0.4, 0.5),
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${invoice.invoice_number || invoice.id}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("PDF_ERROR:", err);

    return NextResponse.json(
      { error: err?.message || "Error generating PDF." },
      { status: 500 }
    );
  }
}
