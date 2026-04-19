import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: RouteProps) {
  try {
    const { id } = await params;

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
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: "Factura no encontrada" },
        { status: 404 }
      );
    }

    const { error: deleteItemsError } = await supabase
      .from("invoice_items")
      .delete()
      .eq("invoice_id", id);

    if (deleteItemsError) {
      console.error("DELETE_INVOICE_ITEMS_ERROR", deleteItemsError);
      return NextResponse.json(
        { error: "No se pudieron eliminar los conceptos" },
        { status: 500 }
      );
    }

    const { error: deleteInvoiceError } = await supabase
      .from("invoices")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteInvoiceError) {
      console.error("DELETE_INVOICE_ERROR", deleteInvoiceError);
      return NextResponse.json(
        { error: "No se pudo eliminar la factura" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE_INVOICE_ROUTE_ERROR", error);
    return NextResponse.json(
      { error: "Error interno eliminando la factura" },
      { status: 500 }
    );
  }
}