import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
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

    const admin = getAdminSupabase();

    const { data: invoice, error: invoiceError } = await admin
      .from("invoices")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: "Factura no encontrada" },
        { status: 404 }
      );
    }

    if (invoice.user_id !== user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { error: itemsError } = await admin
      .from("invoice_items")
      .delete()
      .eq("invoice_id", id);

    if (itemsError) {
      console.error("DELETE_INVOICE_ITEMS_ERROR", itemsError);
      return NextResponse.json(
        { error: "No se pudieron borrar los items" },
        { status: 500 }
      );
    }

    const { error: deleteError } = await admin
      .from("invoices")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("DELETE_INVOICE_ERROR", deleteError);
      return NextResponse.json(
        { error: "No se pudo borrar la factura" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE_ROUTE_ERROR", error);

    return NextResponse.json(
      { error: "Error eliminando factura" },
      { status: 500 }
    );
  }
}