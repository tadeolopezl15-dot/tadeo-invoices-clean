"use client";

import { useState } from "react";

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(value || 0));
}

export default function InvoiceDetailScreen({ invoice }: { invoice: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSendEmail() {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `/api/invoices/${invoice.id}/send-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: invoice.company_email,
            subject: `Invoice ${invoice.invoice_number}`,
            message:
              "Your invoice is ready. You can review it and pay securely using the link below.",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("EMAIL_ERROR:", result);
        throw new Error(result.error || "Email could not be sent.");
      }

      setMessage("Email sent successfully ✅");
    } catch (error: any) {
      console.error("SEND_EMAIL_ERROR:", error);
      setMessage(error?.message || "Error sending email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h1 className="text-3xl font-black">
            Invoice {invoice.invoice_number}
          </h1>

          <p className="text-slate-400 mt-2">
            {invoice.company_name} — {invoice.company_email}
          </p>

          <p className="text-2xl font-black mt-4">
            {money(invoice.total, invoice.currency)}
          </p>

          <p className="text-sm mt-2 text-slate-500">
            Status: {invoice.status}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Send Invoice</h2>

          <button
            onClick={handleSendEmail}
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Email"}
          </button>

          {message && (
            <p className="mt-3 text-sm text-slate-300">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}