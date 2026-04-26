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

    const subtotal = Number(body.subtotal || body.amount || 0);
    const total = Number(body.total || subtotal);

    const payload = {
      user_id: user.id,
      invoice_number: body.invoice_number || `INV-${Date.now()}`,
      client_name: body.client_name,
      client_email: body.client_email,
      company_name: body.company_name || "Tadeo Invoices",
      company_email: body.company_email || "admin@tadeoinvoice.com",
      issue_date: body.issue_date || new Date().toISOString(),
      due_date: body.due_date || new Date().toISOString(),
      currency: body.currency || "USD",
      subtotal,
      total,
      status: body.status || "draft",
    };

    const { data, error } = await supabase
      .from("invoices")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      console.error("CREATE_INVOICE_ERROR", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, invoiceId: data.id });
  } catch (error) {
    console.error("CREATE_INVOICE_FATAL", error);
    return NextResponse.json(
      { error: "Error inesperado creando factura" },
      { status: 500 }
    );
  }
}