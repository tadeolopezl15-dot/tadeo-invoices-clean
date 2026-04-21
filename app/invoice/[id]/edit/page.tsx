import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ lang?: "es" | "en" }>;

type InvoiceRow = {
  id: string;
  client_name: string | null;
  client_email: string | null;
  issue_date: string | null;
  due_date: string | null;
  notes: string | null;
  currency: string | null;
};

type InvoiceItemRow = {
  id: string;
  description: string | null;
  quantity: number | null;
  unit_price: number | null;
};

const translations = {
  es: {
    title: "Editar factura",
    subtitle: "Actualiza los datos principales de tu factura.",
    clientName: "Nombre del cliente",
    clientEmail: "Correo del cliente",
    issueDate: "Fecha de emisión",
    dueDate: "Fecha de vencimiento",
    currency: "Moneda",
    notes: "Notas",
    items: "Conceptos",
    description: "Descripción",
    qty: "Cantidad",
    unitPrice: "Precio unitario",
    save: "Guardar cambios",
    cancel: "Cancelar",
    back: "Volver",
    remove: "Quitar",
    noItems: "No hay conceptos todavía.",
  },
  en: {
    title: "Edit invoice",
    subtitle: "Update the main data of your invoice.",
    clientName: "Client name",
    clientEmail: "Client email",
    issueDate: "Issue date",
    dueDate: "Due date",
    currency: "Currency",
    notes: "Notes",
    items: "Items",
    description: "Description",
    qty: "Quantity",
    unitPrice: "Unit price",
    save: "Save changes",
    cancel: "Cancel",
    back: "Back",
    remove: "Remove",
    noItems: "There are no items yet.",
  },
} as const;

export default async function EditInvoicePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams?: SearchParams;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const lang = sp.lang === "en" ? "en" : "es";
  const t = translations[lang];

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
    .select("id, client_name, client_email, issue_date, due_date, notes, currency")
    .eq("id", id)
    .eq("user_id", user.id)
    .single<InvoiceRow>();

  if (invoiceError || !invoice) {
    notFound();
  }

  const { data: itemsData } = await supabase
    .from("invoice_items")
    .select("id, description, quantity, unit_price")
    .eq("invoice_id", invoice.id)
    .order("id", { ascending: true });

  const items = (itemsData || []) as InvoiceItemRow[];

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

    const clientName = String(formData.get("client_name") || "").trim();
    const clientEmail = String(formData.get("client_email") || "").trim();
    const issueDate = String(formData.get("issue_date") || "").trim();
    const dueDate = String(formData.get("due_date") || "").trim();
    const notes = String(formData.get("notes") || "").trim();
    const currency = String(formData.get("currency") || "USD").trim() || "USD";

    const descriptions = formData.getAll("item_description");
    const quantities = formData.getAll("item_quantity");
    const unitPrices = formData.getAll("item_unit_price");

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

    const subtotal = parsedItems.reduce((sum, item) => sum + item.total, 0);
    const tax = 0;
    const total = subtotal + tax;

    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        client_name: clientName || null,
        client_email: clientEmail || null,
        issue_date: issueDate || null,
        due_date: dueDate || null,
        notes: notes || null,
        currency,
        subtotal,
        tax,
        total,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("UPDATE_INVOICE_ERROR", updateError);
      redirect(`/invoice/${id}/edit?lang=${lang}`);
    }

    await supabase.from("invoice_items").delete().eq("invoice_id", id);

    if (parsedItems.length > 0) {
      const { error: itemsError } = await supabase.from("invoice_items").insert(
        parsedItems.map((item) => ({
          invoice_id: id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
        }))
      );

      if (itemsError) {
        console.error("UPDATE_INVOICE_ITEMS_ERROR", itemsError);
      }
    }

    redirect(`/invoice/${id}?lang=${lang}`);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_45%,_#ffffff_100%)] px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            {t.title}
          </h1>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            {t.subtitle}
          </p>
        </div>

        <form
          action={updateInvoice}
          className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                {t.clientName}
              </label>
              <input
                type="text"
                name="client_name"
                defaultValue={invoice.client_name || ""}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                {t.clientEmail}
              </label>
              <input
                type="email"
                name="client_email"
                defaultValue={invoice.client_email || ""}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                {t.issueDate}
              </label>
              <input
                type="date"
                name="issue_date"
                defaultValue={invoice.issue_date?.slice(0, 10) || ""}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                {t.dueDate}
              </label>
              <input
                type="date"
                name="due_date"
                defaultValue={invoice.due_date?.slice(0, 10) || ""}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                {t.currency}
              </label>
              <input
                type="text"
                name="currency"
                defaultValue={invoice.currency || "USD"}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t.notes}
            </label>
            <textarea
              name="notes"
              defaultValue={invoice.notes || ""}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            />
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-950">{t.items}</h2>

            <div className="mt-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_120px_160px]"
                >
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      {t.description}
                    </label>
                    <input
                      type="text"
                      name="item_description"
                      defaultValue={item.description || ""}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      {t.qty}
                    </label>
                    <input
                      type="number"
                      name="item_quantity"
                      defaultValue={item.quantity || 1}
                      min={1}
                      step="1"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      {t.unitPrice}
                    </label>
                    <input
                      type="number"
                      name="item_unit_price"
                      defaultValue={item.unit_price || 0}
                      min={0}
                      step="0.01"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                    />
                  </div>
                </div>
              ))}

              {items.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                  {t.noItems}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              {t.save}
            </button>

            <Link
              href={`/invoice/${invoice.id}?lang=${lang}`}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
            >
              {t.cancel}
            </Link>

            <Link
              href={`/invoice/${invoice.id}?lang=${lang}`}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
            >
              {t.back}
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}