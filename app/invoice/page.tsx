import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import InvoiceListScreen from "@/components/invoice/InvoiceListScreen";

export default async function InvoiceListPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("LOAD_INVOICES_ERROR", error);
  }

  const normalizedInvoices =
    invoices?.map((invoice) => ({
      id: String(invoice.id),
      invoice_number:
        invoice.invoice_number ||
        invoice.number ||
        `INV-${String(invoice.id).slice(0, 8).toUpperCase()}`,
      client_name: invoice.client_name || "Client",
      client_email: invoice.client_email || "",
      status: String(invoice.status || "pending"),
      payment_status: String(invoice.payment_status || ""),
      currency: String(invoice.currency || "USD"),
      total: Number(invoice.total || 0),
      created_at: invoice.created_at || invoice.issue_date || null,
      due_date: invoice.due_date || null,
      payment_url: invoice.payment_url || "",
    })) || [];

  return <InvoiceListScreen invoices={normalizedInvoices} />;
}