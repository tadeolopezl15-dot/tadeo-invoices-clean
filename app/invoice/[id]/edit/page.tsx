import { notFound, redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import EditInvoiceScreen from "@/components/invoice/EditInvoiceScreen";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
};

export default async function EditInvoicePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const errorMessage = query?.error ? decodeURIComponent(query.error) : "";

  const supabase = await createServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (invoiceError) {
    console.error("LOAD_EDIT_INVOICE_ERROR", invoiceError);
    notFound();
  }

  if (!invoice) {
    notFound();
  }

  const { data: items, error: itemsError } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", id)
    .order("created_at", { ascending: true });

  if (itemsError) {
    console.error("LOAD_EDIT_INVOICE_ITEMS_ERROR", itemsError);
    notFound();
  }

  async function updateInvoice(formData: FormData) {
    "use server";

    const supabase = await createServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect("/login");
    }

    const invoiceId = String(formData.get("invoice_id") || "").trim();
    const clientName = String(formData.get("client_name") || "").trim();
    const clientEmail = String(formData.get("client_email") || "").trim();
    const issueDate = String(formData.get("issue_date") || "").trim();
    const dueDate = String(formData.get("due_date") || "").trim();
    const notes = String(formData.get("notes") || "").trim();
    const currency = String(formData.get("currency") || "USD").trim() || "USD";
    const status = String(formData.get("status") || "pending").trim() || "pending";

    if (!invoiceId) {
      redirect("/dashboard");
    }

    if (!clientName) {
      redirect(
        `/invoice/${invoiceId}/edit?error=Debes%20escribir%20el%20nombre%20del%20cliente`
      );
    }

    const rowIds = formData.getAll("row_id");
    const itemIds = formData.getAll("item_id");
    const descriptions = formData.getAll("item_description");
    const quantities = formData.getAll("item_quantity");
    const unitPrices = formData.getAll("item_unit_price");
    const removedFlags = formData.getAll("item_removed");

    const parsedRows = rowIds.map((rowIdValue, index) => {
      const rowId = String(rowIdValue || "").trim();
      const itemId = String(itemIds[index] || "").trim();
      const description = String(descriptions[index] || "").trim();
      const quantity = Number(quantities[index] || 0);
      const unitPrice = Number(unitPrices[index] || 0);
      const removed = String(removedFlags[index] || "false") === "true";

      return {
        rowId,
        itemId,
        description,
        quantity,
        unitPrice,
        removed,
      };
    });

    const activeRows = parsedRows.filter((row) => !row.removed);

    const validRows = activeRows
      .map((row) => {
        if (!row.description) return null;
        if (!Number.isFinite(row.quantity) || row.quantity <= 0) return null;
        if (!Number.isFinite(row.unitPrice) || row.unitPrice < 0) return null;

        return {
          itemId: row.itemId,
          description: row.description,
          quantity: row.quantity,
          unit_price: row.unitPrice,
          total: row.quantity * row.unitPrice,
        };
      })
      .filter(Boolean) as Array<{
      itemId: string;
      description: string;
      quantity: number;
      unit_price: number;
      total: number;
    }>;

    if (validRows.length === 0) {
      redirect(
        `/invoice/${invoiceId}/edit?error=Agrega%20al%20menos%20un%20concepto%20v%C3%A1lido`
      );
    }

    const subtotal = validRows.reduce((sum, row) => sum + row.total, 0);
    const tax = 0;
    const total = subtotal + tax;

    const { error: updateInvoiceError } = await supabase
      .from("invoices")
      .update({
        client_name: clientName,
        client_email: clientEmail || null,
        issue_date: issueDate || null,
        due_date: dueDate || null,
        notes: notes || null,
        currency,
        status,
        subtotal,
        tax,
        total,
      })
      .eq("id", invoiceId)
      .eq("user_id", user.id);

    if (updateInvoiceError) {
      console.error("UPDATE_INVOICE_ERROR", updateInvoiceError);
      redirect(
        `/invoice/${invoiceId}/edit?error=No%20se%20pudo%20actualizar%20la%20factura`
      );
    }

    const existingIds = (items || []).map((item) => String(item.id));
    const activeExistingIds = validRows
      .filter((row) => row.itemId)
      .map((row) => String(row.itemId));

    const idsToDelete = existingIds.filter((id) => !activeExistingIds.includes(id));

    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("invoice_items")
        .delete()
        .in("id", idsToDelete)
        .eq("invoice_id", invoiceId);

      if (deleteError) {
        console.error("DELETE_INVOICE_ITEMS_ERROR", deleteError);
        redirect(
          `/invoice/${invoiceId}/edit?error=No%20se%20pudieron%20eliminar%20algunos%20conceptos`
        );
      }
    }

    for (const row of validRows) {
      if (row.itemId) {
        const { error: itemUpdateError } = await supabase
          .from("invoice_items")
          .update({
            description: row.description,
            quantity: row.quantity,
            unit_price: row.unit_price,
            total: row.total,
          })
          .eq("id", row.itemId)
          .eq("invoice_id", invoiceId);

        if (itemUpdateError) {
          console.error("UPDATE_INVOICE_ITEM_ERROR", itemUpdateError);
          redirect(
            `/invoice/${invoiceId}/edit?error=No%20se%20pudieron%20actualizar%20los%20conceptos`
          );
        }
      } else {
        const { error: insertItemError } = await supabase
          .from("invoice_items")
          .insert({
            invoice_id: invoiceId,
            description: row.description,
            quantity: row.quantity,
            unit_price: row.unit_price,
            total: row.total,
          });

        if (insertItemError) {
          console.error("INSERT_INVOICE_ITEM_ERROR", insertItemError);
          redirect(
            `/invoice/${invoiceId}/edit?error=No%20se%20pudieron%20guardar%20los%20nuevos%20conceptos`
          );
        }
      }
    }

    redirect(`/invoice/${invoiceId}`);
  }

  const preparedInvoice = {
    id: String(invoice.id),
    client_name: invoice.client_name || "",
    client_email: invoice.client_email || "",
    issue_date: toDateInput(invoice.issue_date || invoice.created_at),
    due_date: toDateInput(invoice.due_date),
    notes: invoice.notes || "",
    currency: invoice.currency || "USD",
    status: invoice.status || "pending",
    invoice_number:
      invoice.invoice_number ||
      invoice.number ||
      `INV-${String(invoice.id).slice(0, 8).toUpperCase()}`,
    items: (items || []).map((item) => ({
      id: String(item.id),
      description: item.description || "",
      quantity: Number(item.quantity || 1),
      unit_price: Number(item.unit_price || 0),
    })),
  };

  return (
    <EditInvoiceScreen
      invoice={preparedInvoice}
      action={updateInvoice}
      errorMessage={errorMessage}
    />
  );
}

function toDateInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}