import { createServerClient } from "@/lib/supabase/server";
import InvoiceDetailScreen from "@/components/invoice/InvoiceDetailScreen";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050816] p-8 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <h1 className="text-3xl font-black">Sign in required</h1>
          <p className="mt-3 text-slate-400">
            You need to sign in to view this invoice.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-2xl bg-blue-500 px-6 py-3 font-black text-white"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !invoice) {
    return (
      <main className="min-h-screen bg-[#050816] p-8 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-400/30 bg-red-500/10 p-8 text-center">
          <h1 className="text-3xl font-black">Invoice not found</h1>
          <p className="mt-3 text-red-200">
            This invoice does not exist or does not belong to this account.
          </p>
          <Link
            href="/invoice"
            className="mt-6 inline-flex rounded-2xl bg-blue-500 px-6 py-3 font-black text-white"
          >
            Back to invoices
          </Link>
        </div>
      </main>
    );
  }

  return <InvoiceDetailScreen invoice={invoice} />;
}