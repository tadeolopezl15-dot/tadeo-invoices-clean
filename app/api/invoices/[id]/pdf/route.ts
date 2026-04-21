import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createServerClient } from "@/lib/supabase/server";

type Params = Promise<{ id: string }>;

export async function GET(
  _req: Request,
  context: { params: Params }
) {
  try {
    const { id } = await context.params;
    const supabase = await createServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(
        "id, invoice_number, client_name, client_email, status, total, subtotal, tax, currency, issue_date, due_date, notes"
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
    }

    const { data: items } = await supabase
      .from("invoice_items")
      .select("description, quantity, unit_price, total")
      .eq("invoice_id", invoice.id)
      .order("id", { ascending: true });

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_name, company_email, company_phone, company_address, logo_url")
      .eq("id", user.id)
      .single();

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = 790;

    page.drawText(profile?.company_name || "Tadeo Invoices", {
      x: 50,
      y,
      size: 22,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.12),
    });

    y -= 28;

    if (profile?.company_email) {
      page.drawText(profile.company_email, {
        x: 50,
        y,
        size: 11,
        font,
        color: rgb(0.35, 0.35, 0.4),
      });
      y -= 16;
    }

    if (profile?.company_phone) {
      page.drawText(profile.company_phone, {
        x: 50,
        y,
        size: 11,
        font,
        color: rgb(0.35, 0.35, 0.4),
      });
      y -= 16;
    }

    if (profile?.company_address) {
      page.drawText(profile.company_address, {
        x: 50,
        y,
        size: 11,
        font,
        color: rgb(0.35, 0.35, 0.4),
      });
    }

    page.drawText(`Invoice ${invoice.invoice_number || ""}`, {
      x: 380,
      y: 790,
      size: 18,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.12),
    });

    page.drawText(`Client: ${invoice.client_name || "-"}`, {
      x: 380,
      y: 764,
      size: 11,
      font,
      color: rgb(0.35, 0.35, 0.4),
    });

    page.drawText(`Email: ${invoice.client_email || "-"}`, {
      x: 380,
      y: 748,
      size: 11,
      font,
      color: rgb(0.35, 0.35, 0.4),
    });

    page.drawLine({
      start: { x: 50, y: 710 },
      end: { x: 545, y: 710 },
      thickness: 1,
      color: rgb(0.88, 0.88, 0.9),
    });

    let tableY = 680;

    page.drawText("Description", {
      x: 50,
      y: tableY,
      size: 11,
      font: fontBold,
      color: rgb(0.25, 0.25, 0.3),
    });
    page.drawText("Qty", {
      x: 330,
      y: tableY,
      size: 11,
      font: fontBold,
      color: rgb(0.25, 0.25, 0.3),
    });
    page.drawText("Unit Price", {
      x: 390,
      y: tableY,
      size: 11,
      font: fontBold,
      color: rgb(0.25, 0.25, 0.3),
    });
    page.drawText("Total", {
      x: 490,
      y: tableY,
      size: 11,
      font: fontBold,
      color: rgb(0.25, 0.25, 0.3),
    });

    tableY -= 20;

    for (const item of items || []) {
      page.drawText(String(item.description || "-"), {
        x: 50,
        y: tableY,
        size: 10,
        font,
        color: rgb(0.1, 0.1, 0.12),
      });

      page.drawText(String(item.quantity || 0), {
        x: 330,
        y: tableY,
        size: 10,
        font,
        color: rgb(0.1, 0.1, 0.12),
      });

      page.drawText(
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: invoice.currency || "USD",
        }).format(Number(item.unit_price || 0)),
        {
          x: 390,
          y: tableY,
          size: 10,
          font,
          color: rgb(0.1, 0.1, 0.12),
        }
      );

      page.drawText(
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: invoice.currency || "USD",
        }).format(Number(item.total || 0)),
        {
          x: 490,
          y: tableY,
          size: 10,
          font,
          color: rgb(0.1, 0.1, 0.12),
        }
      );

      tableY -= 18;
    }

    const totalsY = Math.max(tableY - 30, 140);

    page.drawText("Subtotal:", {
      x: 400,
      y: totalsY,
      size: 11,
      font: fontBold,
      color: rgb(0.25, 0.25, 0.3),
    });
    page.drawText(
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: invoice.currency || "USD",
      }).format(Number(invoice.subtotal || 0)),
      {
        x: 480,
        y: totalsY,
        size: 11,
        font,
        color: rgb(0.1, 0.1, 0.12),
      }
    );

    page.drawText("Tax:", {
      x: 400,
      y: totalsY - 18,
      size: 11,
      font: fontBold,
      color: rgb(0.25, 0.25, 0.3),
    });
    page.drawText(
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: invoice.currency || "USD",
      }).format(Number(invoice.tax || 0)),
      {
        x: 480,
        y: totalsY - 18,
        size: 11,
        font,
        color: rgb(0.1, 0.1, 0.12),
      }
    );

    page.drawText("Total:", {
      x: 400,
      y: totalsY - 42,
      size: 13,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.12),
    });
    page.drawText(
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: invoice.currency || "USD",
      }).format(Number(invoice.total || 0)),
      {
        x: 480,
        y: totalsY - 42,
        size: 13,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.12),
      }
    );

    if (invoice.notes) {
      page.drawText("Notes:", {
        x: 50,
        y: 110,
        size: 11,
        font: fontBold,
        color: rgb(0.25, 0.25, 0.3),
      });

      page.drawText(String(invoice.notes).slice(0, 1800), {
        x: 50,
        y: 92,
        size: 10,
        font,
        color: rgb(0.35, 0.35, 0.4),
        maxWidth: 500,
        lineHeight: 13,
      });
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${invoice.invoice_number || invoice.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("INVOICE_PDF_ERROR", error);
    return NextResponse.json({ error: "No se pudo generar el PDF" }, { status: 500 });
  }
}