import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import NewInvoiceScreen from "@/components/invoice/NewInvoiceScreen";

type SearchParams = Promise<{ lang?: "es" | "en" }>;

const translations = {
  es: {
    title: "Nueva factura",
    subtitle:
      "Crea una factura optimizada para móvil y escritorio con una experiencia profesional.",
  },
  en: {
    title: "New invoice",
    subtitle:
      "Create an invoice optimized for mobile and desktop with a professional experience.",
  },
} as const;

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = (await searchParams) ?? {};
  const lang = params.lang === "en" ? "en" : "es";
  const t = translations[lang];

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
      redirect(`/invoice/new?lang=${lang}&error=client`);
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
      redirect(`/invoice/new?lang=${lang}&error=items`);
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
      redirect(`/invoice/new?lang=${lang}&error=create`);
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
      redirect(`/invoice/new?lang=${lang}&error=items-save`);
    }

    redirect(`/invoice/${invoice.id}`);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_45%,_#ffffff_100%)] px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            {t.title}
          </h1>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            {t.subtitle}
          </p>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
          <NewInvoiceScreen action={createInvoice} />
        </div>
      </div>
    </main>
  );
}