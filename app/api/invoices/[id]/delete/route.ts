import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

type Params = Promise<{ id: string }>;

export async function POST(
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
      return NextResponse.redirect(new URL("/login", "http://localhost:3000"));
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
    }

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .delete()
      .eq("invoice_id", id);

    if (itemsError) {
      console.error("DELETE_INVOICE_ITEMS_ERROR", itemsError);
      return NextResponse.json({ error: "No se pudieron borrar los conceptos" }, { status: 500 });
    }

    const { error: invoiceDeleteError } = await supabase
      .from("invoices")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (invoiceDeleteError) {
      console.error("DELETE_INVOICE_ERROR", invoiceDeleteError);
      return NextResponse.json({ error: "No se pudo borrar la factura" }, { status: 500 });
    }

    return NextResponse.redirect(new URL("/invoice", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
  } catch (error) {
    console.error("DELETE_INVOICE_ROUTE_ERROR", error);
    return NextResponse.json({ error: "Error inesperado" }, { status: 500 });
  }
}