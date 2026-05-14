import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { data: invoice, error } = await supabaseAdmin
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    const { data: items } = await supabaseAdmin
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoice.id);

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const navy = rgb(0.02, 0.05, 0.15);
    const blue = rgb(0.15, 0.39, 0.92);
    const muted = rgb(0.4, 0.46, 0.56);
    const line = rgb(0.88, 0.9, 0.95);
    const light = rgb(0.98, 0.99, 1);

    function money(value: number, currency = "USD") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
      }).format(Number(value || 0));
    }

    page.drawRectangle({
      x: 0,
      y: 0,
      width: 612,
      height: 792,
      color: light,
    });

    page.drawRectangle({
      x: 0,
      y: 720,
      width: 612,
      height: 72,
      color: navy,
    });

    page.drawText("TADEO INVOICES", {
      x: 44,
      y: 748,
      size: 24,
      font: bold,
      color: rgb(1, 1, 1),
    });

    page.drawText(`Invoice #${invoice.invoice_number || invoice.id}`, {
      x: 44,
      y: 708,
      size: 16,
      font: bold,
      color: navy,
    });

    page.drawText(`Client: ${invoice.client_name || "-"}`, {
      x: 44,
      y: 680,
      size: 11,
      font,
      color: muted,
    });

    page.drawText(`Email: ${invoice.client_email || "-"}`, {
      x: 44,
      y: 662,
      size: 11,
      font,
      color: muted,
    });

    page.drawText(`Status: ${invoice.status || "pending"}`, {
      x: 44,
      y: 644,
      size: 11,
      font: bold,
      color:
        invoice.status === "paid"
          ? rgb(0.05, 0.55, 0.28)
          : blue,
    });

    let y = 590;

    page.drawRectangle({
      x: 44,
      y,
      width: 524,
      height: 32,
      color: navy,
    });

    page.drawText("Description", {
      x: 60,
      y: y + 10,
      size: 10,
      font: bold,
      color: rgb(1, 1, 1),
    });

    page.drawText("Qty", {
      x: 320,
      y: y + 10,
      size: 10,
      font: bold,
      color: rgb(1, 1, 1),
    });

    page.drawText("Price", {
      x: 390,
      y: y + 10,
      size: 10,
      font: bold,
      color: rgb(1, 1, 1),
    });

    page.drawText("Total", {
      x: 490,
      y: y + 10,
      size: 10,
      font: bold,
      color: rgb(1, 1, 1),
    });

    y -= 36;

    for (const item of items || []) {
      const qty = Number(item.quantity ?? item.qty ?? 1);
      const price = Number(item.unit_price ?? item.price ?? 0);
      const total = Number(
        item.line_total ?? item.total ?? qty * price
      );

      page.drawRectangle({
        x: 44,
        y: y - 8,
        width: 524,
        height: 30,
        color: rgb(1, 1, 1),
        borderColor: line,
        borderWidth: 0.5,
      });

      page.drawText(
        String(item.description || "-").slice(0, 42),
        {
          x: 60,
          y: y + 2,
          size: 10,
          font,
          color: navy,
        }
      );

      page.drawText(String(qty), {
        x: 324,
        y: y + 2,
        size: 10,
        font,
        color: muted,
      });

      page.drawText(money(price), {
        x: 388,
        y: y + 2,
        size: 10,
        font,
        color: muted,
      });

      page.drawText(money(total), {
        x: 484,
        y: y + 2,
        size: 10,
        font: bold,
        color: navy,
      });

      y -= 30;
    }

    const subtotal = Number(invoice.subtotal || invoice.total || 0);
    const tax = Number(invoice.tax_total || 0);
    const grandTotal = Number(invoice.total || subtotal + tax);

    page.drawRectangle({
      x: 340,
      y: 140,
      width: 228,
      height: 90,
      color: rgb(0.93, 0.96, 1),
      borderColor: line,
      borderWidth: 1,
    });

    page.drawText("Subtotal", {
      x: 360,
      y: 204,
      size: 10,
      font,
      color: muted,
    });

    page.drawText(money(subtotal), {
      x: 470,
      y: 204,
      size: 10,
      font: bold,
      color: navy,
    });

    page.drawText("Tax", {
      x: 360,
      y: 178,
      size: 10,
      font,
      color: muted,
    });

    page.drawText(money(tax), {
      x: 470,
      y: 178,
      size: 10,
      font: bold,
      color: navy,
    });

    page.drawLine({
      start: { x: 360, y: 160 },
      end: { x: 548, y: 160 },
      thickness: 1,
      color: line,
    });

    page.drawText("TOTAL", {
      x: 360,
      y: 136,
      size: 14,
      font: bold,
      color: navy,
    });

    page.drawText(money(grandTotal), {
      x: 448,
      y: 134,
      size: 18,
      font: bold,
      color: blue,
    });

    page.drawText("Thank you for your business.", {
      x: 44,
      y: 52,
      size: 10,
      font: bold,
      color: navy,
    });

    page.drawText("Generated by Tadeo Invoices", {
      x: 44,
      y: 36,
      size: 8,
      font,
      color: muted,
    });

    // =========================
    // STRIPE PAYMENT QR
    // =========================

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      new URL(req.url).origin;

    const payUrl = `${siteUrl}/api/invoices/${invoice.id}/pay`;

    const qrDataUrl = await QRCode.toDataURL(payUrl, {
      width: 180,
      margin: 1,
    });

    const qrBytes = Buffer.from(
      qrDataUrl.replace(/^data:image\/png;base64,/, ""),
      "base64"
    );

    const qrImage = await pdfDoc.embedPng(qrBytes);

    page.drawText("Scan to pay securely", {
      x: 392,
      y: 62,
      size: 9,
      font: bold,
      color: navy,
    });

    page.drawImage(qrImage, {
      x: 420,
      y: 10,
      width: 90,
      height: 90,
    });

    page.drawText("Stripe secure payment", {
      x: 410,
      y: 2,
      size: 7,
      font,
      color: muted,
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${invoice.invoice_number || invoice.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF_ERROR", error);

    return NextResponse.json(
      { error: "Could not generate PDF" },
      { status: 500 }
    );
  }
}