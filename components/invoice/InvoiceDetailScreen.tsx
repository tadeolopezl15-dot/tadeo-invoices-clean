"use client";

import { useState } from "react";
import Link from "next/link";

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(value || 0));
}

export default function InvoiceDetailScreen({ invoice }: { invoice: any }) {
  const [sending, setSending] = useState(false);
  const [sendMessage, setSendMessage] = useState("");

  async function handleSendEmail() {
    setSending(true);
    setSendMessage("");

    try {
      const response = await fetch(`/api/invoices/${invoice.id}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: invoice.company_email,
          subject: `Invoice ${invoice.invoice_number || invoice.id}`,
          message:
            "Your invoice is ready. You can review it and pay securely using the link below.",
        }),
      });

      const text = await response.text();
      console.log("SEND EMAIL RAW RESPONSE:", text);

      let result: any = {};
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error("The API did not return JSON.");
      }

      if (!response.ok) {
        throw new Error(result.error || "Email could not be sent.");
      }

      setSendMessage("Email sent successfully ✅");
    } catch (error: any) {
      console.error("SEND_EMAIL_ERROR:", error);
      setSendMessage(error?.message || "Error sending email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] px-6 py-8 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href="/invoice"
          className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-blue-200 hover:bg-white/10"
        >
          ← Back to invoices
        </Link>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <h1 className="text-4xl font-black">
            Invoice {invoice.invoice_number || invoice.id}
          </h1>

          <p className="mt-3 text-slate-400">
            {invoice.company_name || "Unnamed client"} ·{" "}
            {invoice.company_email || "No email"}
          </p>

          <p className="mt-6 text-4xl font-black">
            {money(invoice.total, invoice.currency || "USD")}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Status: {invoice.status || "pending"}
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-black">Send Invoice</h2>
          <p className="mt-2 text-sm text-slate-400">
            Sends this invoice to the client email on file.
          </p>

          <button
            type="button"
            onClick={handleSendEmail}
            disabled={sending || !invoice.company_email}
            className="mt-5 w-full rounded-2xl bg-blue-500 px-6 py-4 font-black text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Email"}
          </button>

          {sendMessage ? (
            <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
              {sendMessage}
            </p>
          ) : null}

          {!invoice.company_email ? (
            <p className="mt-4 text-sm text-red-300">
              This invoice does not have a client email.
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}