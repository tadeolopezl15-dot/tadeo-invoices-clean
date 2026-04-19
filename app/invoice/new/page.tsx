import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import NewInvoiceScreen from "@/components/invoice/NewInvoiceScreen";

export default async function NewInvoicePage() {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  async function createInvoice(formData: FormData) {
    "use server";

    const supabase = await createServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      redirect("/login");
    }

    const clientName = String(formData.get("client_name") || "").trim();
    const clientEmail = String(formData.get("client_email") || "").trim();
    const issueDate = String(formData.get("issue_date") || "").trim();
    const dueDate = String(formData.get("due_date") || "").trim();
    const notes = String(formData.get("notes") || "").trim();
    const currency = String(formData.get("currency") || "USD").trim() || "USD";

    const descriptions = formData.getAll("item_description");
    const quantities = formData.getAll("item_quantity");
    const unitPrices = formData.getAll("item_unit_price");

    if (!clientName) {
      redirect("/invoice/new?error=Debes%20escribir%20el%20nombre%20del%20cliente");
    }

    const parsedItems = descriptions
      .map((description, index) => {
        const desc = String(description || "").trim();
        const qty = Number(quantities[index] || 0);
        const price = Number(unitPrices[index] || 0);

        if (!desc) return null;
        if (!Number.isFinite(qty) || qty <= 0) return null;
        if (!Number.isFinite(price) || price < 0) return null;

        return {
          description: desc,
          quantity: qty,
          unit_price: price,
          total: qty * price,
        };
      })
      .filter(Boolean) as Array<{
        description: string;
        quantity: number;
        unit_price: number;
        total: number;
      }>;

    if (parsedItems.length === 0) {
      redirect("/invoice/new?error=Agrega%20al%20menos%20un%20concepto%20v%C3%A1lido");
    }

    const subtotal = parsedItems.reduce((sum, item) => sum + item.total, 0);
    const tax = 0;
    const total = subtotal + tax;

    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        user_id: user.id,
        invoice_number: invoiceNumber,
        client_name: clientName,
        client_email: clientEmail || null,
        status: "pending",
        issue_date: issueDate || new Date().toISOString(),
        due_date: dueDate || null,
        notes: notes || null,
        subtotal,
        tax,
        total,
        currency,
      })
      .select("id")
      .single();

    if (invoiceError || !invoice) {
      console.error("CREATE_INVOICE_ERROR", invoiceError);
      redirect("/invoice/new?error=No%20se%20pudo%20crear%20la%20factura");
    }

    const itemsToInsert = parsedItems.map((item) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total,
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("CREATE_INVOICE_ITEMS_ERROR", itemsError);

      await supabase.from("invoices").delete().eq("id", invoice.id);

      redirect("/invoice/new?error=No%20se%20pudieron%20guardar%20los%20conceptos");
    }

    redirect(`/invoice/${invoice.id}`);
  }

  return <NewInvoiceScreen action={createInvoice} />;
}