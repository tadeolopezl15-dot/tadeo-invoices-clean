import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import InvoiceListScreen from "@/components/invoice/InvoiceListScreen";

export default async function InvoicePage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, client_name, client_email, status, total, issue_date, currency")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <AppHeader />
      <InvoiceListScreen invoices={invoices || []} />
    </>
  );
}