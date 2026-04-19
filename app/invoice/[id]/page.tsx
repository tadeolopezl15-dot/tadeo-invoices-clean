import { notFound, redirect } from "next/navigation";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase/server";
import InvoiceDetailScreen from "@/components/invoice/InvoiceDetailScreen";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ paid?: string; canceled?: string; session_id?: string }>;
};

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Falta STRIPE_SECRET_KEY en .env.local");
}

const stripe = new Stripe(stripeSecretKey);

export default async function InvoiceDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};

  const supabase = await createServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // Confirmación síncrona al volver desde Stripe
  if (query?.paid === "1" && query?.session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(query.session_id);

      const invoiceIdFromSession = String(session.metadata?.invoice_id || "").trim();
      const paymentStatus = String(session.payment_status || "").toLowerCase();

      if (
        invoiceIdFromSession === id &&
        (paymentStatus === "paid" || session.status === "complete")
      ) {
        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id || null;

        await supabase
          .from("invoices")
          .update({
            status: "paid",
            payment_status: "paid",
            paid_at: new Date().toISOString(),
            stripe_session_id: session.id,
            stripe_payment_intent_id: paymentIntentId,
            payment_email:
              session.customer_details?.email || session.customer_email || null,
            payment_currency: String(session.currency || "usd").toUpperCase(),
            payment_amount: Number(session.amount_total || 0) / 100,
          })
          .eq("id", id)
          .eq("user_id", user.id);
      }
    } catch (error) {
      console.error("SYNC_PAYMENT_CONFIRM_ERROR", error);
    }
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (invoiceError) {
    console.error("LOAD_INVOICE_ERROR", invoiceError);
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
    console.error("LOAD_INVOICE_ITEMS_ERROR", itemsError);
    notFound();
  }

  const invoiceData = {
    ...invoice,
    items: (items || []).map((item) => ({
      ...item,
      unit_price: Number(item.unit_price || 0),
      quantity: Number(item.quantity || 0),
    })),
  };

  return (
    <InvoiceDetailScreen
      invoice={invoiceData}
      paymentSuccess={query?.paid === "1"}
      paymentCanceled={query?.canceled === "1"}
    />
  );
}