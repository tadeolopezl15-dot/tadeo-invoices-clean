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

function text(lang: "es" | "en") {
  return lang === "en"
    ? {
        invoice: "INVOICE",
        from: "FROM",
        billTo: "BILL TO",
        issue: "Issue date",
        due: "Due date",
        desc: "Description",
        qty: "Qty",
        price: "Price",
        total: "Total",
        subtotal: "Subtotal",
        tax: "Tax",
        thanks: "Thank you for your business",
      }
    : {
        invoice: "FACTURA",
        from: "DE",
        billTo: "PARA",
        issue: "Emisión",
        due: "Vencimiento",
        desc: "Descripción",
        qty: "Cant.",
        price: "Precio",
        total: "Total",
        subtotal: "Subtotal",
        tax: "Impuestos",
        thanks: "Gracias por tu negocio",
      };
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const url = new URL(req.url);
  const lang = url.searchParams.get("lang") === "en" ? "en" : "es";
  const t = text(lang);

  const { data: invoice } = await supabaseAdmin
    .from("invoices")
    .select("*, invoice_items(*)")
    .eq("id", id)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("company_name, company_email, company_phone, company_address, logo_url")
    .eq("id", invoice.user_id)
    .single();

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 760;

  // Logo
  if (profile?.logo_url) {
    try {
      const logoRes = await fetch(profile.logo_url);
      const logoBytes = await logoRes.arrayBuffer();
      const isPng = profile.logo_url.toLowerCase().includes(".png");
      const logo = isPng
        ? await pdfDoc.embedPng(logoBytes)
        : await pdfDoc.embedJpg(logoBytes);

      page.drawImage(logo, {
        x: 50,
        y: 720,
        width: 120,
        height: 50,
      });
    } catch {
      page.drawText("TADEO INVOICES", {
        x: 50,
        y,
        size: 16,
        font: bold,
        color: rgb(0.1, 0.2, 0.4),
      });
    }
  } else {
    page.drawText("TADEO INVOICES", {
      x: 50,
      y,
      size: 16,
      font: bold,
      color: rgb(0.1, 0.2, 0.4),
    });
  }

  page.drawText(`${t.invoice} #${invoice.invoice_number || ""}`, {
    x: 360,
    y,
    size: 14,
    font: bold,
    color: rgb(0.1, 0.2, 0.4),
  });

  y -= 55;

  page.drawLine({
    start: { x: 50, y },
    end: { x: 550, y },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.9),
  });

  y -= 35;

  const companyName = profile?.company_name || invoice.company_name || "Tadeo Invoices";
  const companyEmail = profile?.company_email || invoice.company_email || "";

  page.drawText(`${t.from}:`, { x: 50, y, size: 10, font: bold });
  page.drawText(companyName, { x: 50, y: y - 16, size: 12, font });
  page.drawText(companyEmail, {
    x: 50,
    y: y - 32,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  page.drawText(`${t.billTo}:`, { x: 300, y, size: 10, font: bold });
  page.drawText(invoice.client_name || "-", {
    x: 300,
    y: y - 16,
    size: 12,
    font,
  });
  page.drawText(invoice.client_email || "", {
    x: 300,
    y: y - 32,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  y -= 85;

  page.drawText(`${t.issue}: ${invoice.issue_date || "-"}`, {
    x: 50,
    y,
    size: 10,
    font,
  });

  page.drawText(`${t.due}: ${invoice.due_date || "-"}`, {
    x: 300,
    y,
    size: 10,
    font,
  });

  y -= 40;

  page.drawRectangle({
    x: 50,
    y,
    width: 500,
    height: 26,
    color: rgb(0.94, 0.97, 1),
  });

  page.drawText(t.desc, { x: 60, y: y + 9, size: 10, font: bold });
  page.drawText(t.qty, { x: 260, y: y + 9, size: 10, font: bold });
  page.drawText(t.price, { x: 320, y: y + 9, size: 10, font: bold });
  page.drawText(t.total, { x: 450, y: y + 9, size: 10, font: bold });

  y -= 32;

  invoice.invoice_items?.forEach((item: any) => {
    const qty = item.quantity || item.qty || 1;
    const price = item.price || item.unit_price || 0;
    const total = item.line_total || item.total || qty * price;

    page.drawText((item.description || "-").slice(0, 32), {
      x: 60,
      y,
      size: 10,
      font,
    });
    page.drawText(String(qty), { x: 270, y, size: 10, font });
    page.drawText(money(price, invoice.currency || "USD"), {
      x: 320,
      y,
      size: 10,
      font,
    });
    page.drawText(money(total, invoice.currency || "USD"), {
      x: 450,
      y,
      size: 10,
      font,
    });

    y -= 22;
  });

  y -= 20;

  page.drawLine({
    start: { x: 300, y },
    end: { x: 550, y },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.9),
  });

  y -= 22;

  page.drawText(`${t.subtotal}:`, { x: 350, y, size: 10, font });
  page.drawText(money(invoice.subtotal || 0, invoice.currency || "USD"), {
    x: 450,
    y,
    size: 10,
    font,
  });

  y -= 18;

  page.drawText(`${t.tax}:`, { x: 350, y, size: 10, font });
  page.drawText(
    money(invoice.tax_total || invoice.tax || 0, invoice.currency || "USD"),
    { x: 450, y, size: 10, font }
  );

  y -= 24;

  page.drawText(t.total.toUpperCase(), { x: 350, y, size: 13, font: bold });
  page.drawText(money(invoice.total || 0, invoice.currency || "USD"), {
    x: 450,
    y,
    size: 13,
    font: bold,
    color: rgb(0.15, 0.39, 0.92),
  });

  y -= 45;

  page.drawText(t.thanks, {
    x: 50,
    y,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = Buffer.from(pdfBytes);

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="invoice-${
        invoice.invoice_number || invoice.id
      }-${lang}.pdf"`,
    },
  });
}