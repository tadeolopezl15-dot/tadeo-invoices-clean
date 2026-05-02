import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const supabaseUser = await createServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { items, ...invoicePayload } = body;

    const { data: invoice, error: invoiceError } = await admin
      .from("invoices")
      .insert({
        ...invoicePayload,
        user_id: user.id,
      })
      .select("id")
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: invoiceError?.message || "Invoice insert failed", details: invoiceError },
        { status: 400 }
      );
    }

    const itemsToInsert = items.map((item: any) => ({
      invoice_id: invoice.id,
      description: item.description,
      qty: item.qty,
      unit_price: item.unit_price,
      line_total: item.line_total,
    }));

    const { error: itemsError } = await admin
      .from("invoice_items")
      .insert(itemsToInsert);

    if (itemsError) {
      return NextResponse.json(
        { error: itemsError.message, details: itemsError },
        { status: 400 }
      );
    }

    return NextResponse.json({ id: invoice.id });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}