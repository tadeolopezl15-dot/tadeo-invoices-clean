"use client";

import { useState } from "react";

export default function SendInvoiceButton({
  invoice,
}: {
  invoice: any;
}) {
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
              "Your invoice is ready. You can review it using the secure link below.",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("EMAIL_ERROR:", result);
        throw new Error(result.error || "Email could not be sent.");
      }

      setMessage("✅ Email sent successfully");
    } catch (error: any) {
      console.error("SEND_EMAIL_ERROR:", error);
      setMessage(error.message || "Error sending email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleSendEmail}
        disabled={loading}
        className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send Email"}
      </button>

      {message && (
        <p className="text-sm text-slate-300">{message}</p>
      )}
    </div>
  );
}