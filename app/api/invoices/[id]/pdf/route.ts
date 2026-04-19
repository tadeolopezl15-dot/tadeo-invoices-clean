import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createServerClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;

    const supabase = await createServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (invoiceError || !invoice) {
      return new NextResponse("Factura no encontrada", { status: 404 });
    }

    const { data: items, error: itemsError } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id)
      .order("created_at", { ascending: true });

    if (itemsError) {
      return new NextResponse("No se pudieron cargar los conceptos", {
        status: 500,
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_name, logo_url, full_name")
      .eq("id", user.id)
      .maybeSingle();

    const invoiceNumber =
      invoice.invoice_number ||
      invoice.number ||
      `INV-${String(invoice.id).slice(0, 8).toUpperCase()}`;

    const clientName =
      invoice.client_name || invoice.client || invoice.customer_name || "Client";

    const clientEmail =
      invoice.client_email || invoice.customer_email || invoice.email || "";

    const currency = invoice.currency || "USD";
    const companyName =
      profile?.company_name ||
      user.user_metadata?.company_name ||
      profile?.full_name ||
      "My Business";

    const logoUrl = profile?.logo_url || "";

    const normalizedItems =
      items?.map((item) => {
        const quantity = Number(item.quantity || 1);
        const unitPrice = Number(item.unit_price || item.price || 0);
        const total =
          Number(item.total || 0) || Number(quantity) * Number(unitPrice);

        return {
          description: item.description || item.name || "Service",
          quantity,
          unitPrice,
          total,
        };
      }) || [];

    const subtotal =
      normalizedItems.length > 0
        ? normalizedItems.reduce((sum, item) => sum + item.total, 0)
        : Number(invoice.subtotal || invoice.total || 0);

    const tax = Number(invoice.tax || 0);
    const total = Number(invoice.total || subtotal + tax);

    const issueDate = formatDate(invoice.issue_date || invoice.created_at);
    const dueDate = formatDate(invoice.due_date);
    const notes = String(invoice.notes || "");
    const status = String(invoice.status || "pending").toUpperCase();

    const pdfDoc = await PDFDocument.create();
    pdfDoc.setTitle(`Invoice ${invoiceNumber}`);
    pdfDoc.setAuthor(companyName);
    pdfDoc.setCreator("Business Invoice Platform");
    pdfDoc.setProducer("Business Invoice Platform");

    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const colors = {
      dark: rgb(0.08, 0.11, 0.18),
      text: rgb(0.15, 0.18, 0.24),
      muted: rgb(0.45, 0.49, 0.56),
      line: rgb(0.88, 0.9, 0.93),
      soft: rgb(0.95, 0.97, 0.99),
      blue: rgb(0.17, 0.37, 0.68),
      green: rgb(0.12, 0.62, 0.39),
      amber: rgb(0.85, 0.55, 0.12),
      red: rgb(0.78, 0.2, 0.2),
    };

    const marginX = 42;
    let y = height - 48;

    // Fondo encabezado
    page.drawRectangle({
      x: marginX,
      y: y - 82,
      width: width - marginX * 2,
      height: 82,
      color: colors.soft,
      borderWidth: 0,
    });

    // Logo o texto empresa
    let logoDrawn = false;

    if (logoUrl) {
      try {
        const logoRes = await fetch(logoUrl);
        if (logoRes.ok) {
          const logoBytes = await logoRes.arrayBuffer();
          const contentType = logoRes.headers.get("content-type") || "";

          let embeddedImage:
            | Awaited<ReturnType<typeof pdfDoc.embedPng>>
            | Awaited<ReturnType<typeof pdfDoc.embedJpg>>
            | null = null;

          if (contentType.includes("png")) {
            embeddedImage = await pdfDoc.embedPng(logoBytes);
          } else if (contentType.includes("jpeg") || contentType.includes("jpg")) {
            embeddedImage = await pdfDoc.embedJpg(logoBytes);
          } else {
            // Fallback por extensión
            if (logoUrl.toLowerCase().endsWith(".png")) {
              embeddedImage = await pdfDoc.embedPng(logoBytes);
            } else if (
              logoUrl.toLowerCase().endsWith(".jpg") ||
              logoUrl.toLowerCase().endsWith(".jpeg")
            ) {
              embeddedImage = await pdfDoc.embedJpg(logoBytes);
            }
          }

          if (embeddedImage) {
            const maxWidth = 150;
            const maxHeight = 52;
            const dims = embeddedImage.scale(1);

            const scale = Math.min(
              maxWidth / dims.width,
              maxHeight / dims.height,
              1
            );

            page.drawImage(embeddedImage, {
              x: marginX + 14,
              y: y - 68,
              width: dims.width * scale,
              height: dims.height * scale,
            });

            logoDrawn = true;
          }
        }
      } catch (error) {
        console.error("PDF_LOGO_LOAD_ERROR", error);
      }
    }

    if (!logoDrawn) {
      page.drawText(companyName, {
        x: marginX + 14,
        y: y - 36,
        size: 20,
        font: fontBold,
        color: colors.dark,
      });

      page.drawText("Professional Invoice", {
        x: marginX + 14,
        y: y - 58,
        size: 10,
        font: fontRegular,
        color: colors.muted,
      });
    }

    page.drawText("INVOICE", {
      x: width - 180,
      y: y - 34,
      size: 26,
      font: fontBold,
      color: colors.dark,
    });

    page.drawText(`#${invoiceNumber}`, {
      x: width - 180,
      y: y - 58,
      size: 12,
      font: fontRegular,
      color: colors.text,
    });

    y -= 112;

    // Dos bloques superiores
    page.drawText("Bill To", {
      x: marginX,
      y,
      size: 12,
      font: fontBold,
      color: colors.blue,
    });

    page.drawText("Invoice Details", {
      x: 320,
      y,
      size: 12,
      font: fontBold,
      color: colors.blue,
    });

    page.drawLine({
      start: { x: marginX, y: y - 8 },
      end: { x: 280, y: y - 8 },
      thickness: 1,
      color: colors.line,
    });

    page.drawLine({
      start: { x: 320, y: y - 8 },
      end: { x: width - marginX, y: y - 8 },
      thickness: 1,
      color: colors.line,
    });

    y -= 38;

    page.drawText(clientName, {
      x: marginX,
      y,
      size: 14,
      font: fontBold,
      color: colors.text,
    });

    if (clientEmail) {
      page.drawText(clientEmail, {
        x: marginX,
        y: y - 24,
        size: 11,
        font: fontRegular,
        color: colors.text,
      });
    }

    page.drawText(`Status: ${status}`, {
      x: 320,
      y,
      size: 11,
      font: fontRegular,
      color: colors.text,
    });

    page.drawText(`Issue Date: ${issueDate || "-"}`, {
      x: 320,
      y: y - 22,
      size: 11,
      font: fontRegular,
      color: colors.text,
    });

    page.drawText(`Due Date: ${dueDate || "-"}`, {
      x: 320,
      y: y - 44,
      size: 11,
      font: fontRegular,
      color: colors.text,
    });

    page.drawText(`Currency: ${currency}`, {
      x: 320,
      y: y - 66,
      size: 11,
      font: fontRegular,
      color: colors.text,
    });

    y -= 118;

    // Header tabla
    page.drawRectangle({
      x: marginX,
      y: y - 18,
      width: width - marginX * 2,
      height: 28,
      color: colors.blue,
    });

    page.drawText("Description", {
      x: marginX + 14,
      y,
      size: 11,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText("Qty", {
      x: 325,
      y,
      size: 11,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText("Price", {
      x: 395,
      y,
      size: 11,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText("Amount", {
      x: 485,
      y,
      size: 11,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    y -= 34;

    if (normalizedItems.length === 0) {
      page.drawText("No items added to this invoice.", {
        x: marginX + 14,
        y,
        size: 11,
        font: fontRegular,
        color: colors.text,
      });
      y -= 24;
    } else {
      for (const item of normalizedItems) {
        if (y < 180) break;

        page.drawText(truncate(item.description, 48), {
          x: marginX + 14,
          y,
          size: 11,
          font: fontRegular,
          color: colors.text,
        });

        drawRightText(page, String(item.quantity), 350, y, fontRegular, 11, colors.text);
        drawRightText(
          page,
          formatMoney(item.unitPrice, currency),
          455,
          y,
          fontRegular,
          11,
          colors.text
        );
        drawRightText(
          page,
          formatMoney(item.total, currency),
          545,
          y,
          fontBold,
          11,
          colors.text
        );

        page.drawLine({
          start: { x: marginX, y: y - 10 },
          end: { x: width - marginX, y: y - 10 },
          thickness: 0.8,
          color: colors.line,
        });

        y -= 28;
      }
    }

    const summaryTop = Math.max(190, y - 8);

    page.drawRectangle({
      x: 335,
      y: summaryTop - 82,
      width: 218,
      height: 82,
      color: colors.soft,
    });

    page.drawText("Subtotal", {
      x: 348,
      y: summaryTop - 20,
      size: 11,
      font: fontRegular,
      color: colors.text,
    });

    drawRightText(
      page,
      formatMoney(subtotal, currency),
      540,
      summaryTop - 20,
      fontRegular,
      11,
      colors.text
    );

    page.drawText("Tax", {
      x: 348,
      y: summaryTop - 42,
      size: 11,
      font: fontRegular,
      color: colors.text,
    });

    drawRightText(
      page,
      formatMoney(tax, currency),
      540,
      summaryTop - 42,
      fontRegular,
      11,
      colors.text
    );

    page.drawLine({
      start: { x: 348, y: summaryTop - 50 },
      end: { x: 540, y: summaryTop - 50 },
      thickness: 1,
      color: colors.line,
    });

    page.drawText("Total", {
      x: 348,
      y: summaryTop - 72,
      size: 13,
      font: fontBold,
      color: colors.text,
    });

    drawRightText(
      page,
      formatMoney(total, currency),
      540,
      summaryTop - 72,
      fontBold,
      13,
      colors.text
    );

    if (notes) {
      const notesTop = summaryTop - 120;

      page.drawText("Notes", {
        x: marginX,
        y: notesTop,
        size: 12,
        font: fontBold,
        color: colors.blue,
      });

      page.drawLine({
        start: { x: marginX, y: notesTop - 8 },
        end: { x: width - marginX, y: notesTop - 8 },
        thickness: 1,
        color: colors.line,
      });

      const wrapped = wrapText(notes, 90);

      wrapped.slice(0, 6).forEach((line, index) => {
        page.drawText(line, {
          x: marginX + 8,
          y: notesTop - 34 - index * 16,
          size: 10,
          font: fontRegular,
          color: colors.text,
        });
      });
    }

    page.drawLine({
      start: { x: marginX, y: 72 },
      end: { x: width - marginX, y: 72 },
      thickness: 1,
      color: colors.line,
    });

    page.drawText("Generated securely from your invoicing platform", {
      x: 175,
      y: 46,
      size: 9,
      font: fontRegular,
      color: colors.muted,
    });

    const pdfBytes = await pdfDoc.save();
    const fileName = `invoice-${invoiceNumber}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("INVOICE_PDF_ROUTE_ERROR", error);
    return new NextResponse("No se pudo generar el PDF", { status: 500 });
  }
}

function drawRightText(
  page: any,
  text: string,
  rightX: number,
  y: number,
  font: any,
  size: number,
  color: ReturnType<typeof rgb>
) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: rightX - width,
    y,
    size,
    font,
    color,
  });
}

function truncate(value: string, max: number) {
  const text = String(value || "");
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(value || 0);
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function wrapText(text: string, maxCharsPerLine: number) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxCharsPerLine) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}