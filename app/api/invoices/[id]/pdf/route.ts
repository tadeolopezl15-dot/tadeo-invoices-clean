import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value || 0);
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const { data: invoice } = await supabaseAdmin
    .from("invoices")
    .select("*, invoice_items(*)")
    .eq("id", id)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Factura no encontrada" });
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 760;

  // 🔷 HEADER
  page.drawText("TADEO INVOICES", {
    x: 50,
    y,
    size: 16,
    font: bold,
    color: rgb(0.1, 0.2, 0.4),
  });

  page.drawText(`Factura #${invoice.invoice_number}`, {
    x: 380,
    y,
    size: 12,
    font,
  });

  y -= 40;

  page.drawLine({
    start: { x: 50, y },
    end: { x: 550, y },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.9),
  });

  y -= 30;

  // 🧾 INFO
  page.drawText("DE:", { x: 50, y, size: 10, font: bold });
  page.drawText(invoice.company_name || "-", {
    x: 50,
    y: y - 15,
    size: 12,
    font,
  });

  page.drawText(invoice.company_email || "", {
    x: 50,
    y: y - 30,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  page.drawText("PARA:", { x: 300, y, size: 10, font: bold });

  page.drawText(invoice.client_name || "-", {
    x: 300,
    y: y - 15,
    size: 12,
    font,
  });

  page.drawText(invoice.client_email || "", {
    x: 300,
    y: y - 30,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  y -= 80;

  // 📅 FECHAS
  page.drawText(`Emisión: ${invoice.issue_date || "-"}`, {
    x: 50,
    y,
    size: 10,
    font,
  });

  page.drawText(`Vencimiento: ${invoice.due_date || "-"}`, {
    x: 300,
    y,
    size: 10,
    font,
  });

  y -= 40;

  // 🔲 HEADER TABLA
  page.drawRectangle({
    x: 50,
    y,
    width: 500,
    height: 25,
    color: rgb(0.95, 0.97, 1),
  });

  page.drawText("Descripción", { x: 60, y: y + 8, size: 10, font: bold });
  page.drawText("Cant.", { x: 260, y: y + 8, size: 10, font: bold });
  page.drawText("Precio", { x: 320, y: y + 8, size: 10, font: bold });
  page.drawText("Total", { x: 450, y: y + 8, size: 10, font: bold });

  y -= 30;

  // 📦 ITEMS
  invoice.invoice_items?.forEach((item: any) => {
    const qty = item.quantity || item.qty || 1;
    const price = item.price || item.unit_price || 0;
    const total = item.line_total || qty * price;

    page.drawText(item.description || "-", { x: 60, y, size: 10, font });
    page.drawText(String(qty), { x: 270, y, size: 10, font });
    page.drawText(money(price), { x: 320, y, size: 10, font });
    page.drawText(money(total), { x: 450, y, size: 10, font });

    y -= 20;
  });

  y -= 20;

  // 🔵 LINEA
  page.drawLine({
    start: { x: 300, y },
    end: { x: 550, y },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.9),
  });

  y -= 20;

  // 💰 TOTALES
  page.drawText("Subtotal:", { x: 350, y, size: 10, font });
  page.drawText(money(invoice.subtotal || 0), {
    x: 450,
    y,
    size: 10,
    font,
  });

  y -= 15;

  page.drawText("Impuestos:", { x: 350, y, size: 10, font });
  page.drawText(money(invoice.tax_total || 0), {
    x: 450,
    y,
    size: 10,
    font,
  });

  y -= 20;

  page.drawText("TOTAL", { x: 350, y, size: 12, font: bold });
  page.drawText(money(invoice.total || 0), {
    x: 450,
    y,
    size: 12,
    font: bold,
  });

  y -= 40;

  // 🧾 FOOTER
  page.drawText("Gracias por tu negocio", {
    x: 50,
    y,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  // 🔥 FIX FINAL PARA VERCEL
  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = Buffer.from(pdfBytes);

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="invoice-${
        invoice.invoice_number || invoice.id
      }.pdf"`,
    },
  });
}