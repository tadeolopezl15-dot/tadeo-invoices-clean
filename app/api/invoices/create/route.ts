import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: Request) {
  try {
    const body = await req.json();
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

    const items = Array.isArray(body.items) ? body.items : [];

    const subtotal = items.reduce((sum: number, item: any) => {
      const qty = Number(item.quantity || 0);
      const price = Number(item.unit_price || 0);
      return sum + qty * price;
    }, 0);

    const total = subtotal;

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        user_id: user.id,
        invoice_number: `INV-${Date.now()}`,
        client_name: body.client_name,
        client_email: body.client_email,
        company_name: body.company_name || "Tadeo Invoices",
        company_email: body.company_email || "admin@tadeoinvoice.com",
        issue_date: body.issue_date,
        due_date: body.due_date,
        currency: body.currency || "USD",
        subtotal,
        total,
        status: "draft",
      })
      .select("id")
      .single();

    if (invoiceError) {
      return NextResponse.json({ error: invoiceError.message }, { status: 400 });
    }

    const cleanItems = items
      .filter((item: any) => item.description)
      .map((item: any) => {
        const quantity = Number(item.quantity || 1);
        const unit_price = Number(item.unit_price || 0);

        return {
          invoice_id: invoice.id,
          description: item.description,
          quantity,
          unit_price,
          total: quantity * unit_price,
        };
      });

    if (cleanItems.length > 0) {
      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(cleanItems);

      if (itemsError) {
        return NextResponse.json({ error: itemsError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ ok: true, invoiceId: invoice.id });
  } catch (error) {
    console.error("CREATE_INVOICE_FATAL", error);
    return NextResponse.json(
      { error: "Error inesperado creando factura" },
      { status: 500 }
    );
  }
}