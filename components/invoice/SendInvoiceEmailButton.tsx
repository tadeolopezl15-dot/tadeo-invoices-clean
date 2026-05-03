"use client";

import { useState } from "react";

export default function SendInvoiceEmailButton({
  invoiceId,
  email,
}: {
  invoiceId: string;
  email?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSend() {
    try {
      setLoading(true);
      setMessage("");

      if (!email) {
        throw new Error("This invoice has no client email.");
      }

      const response = await fetch(
        `/api/invoices/${invoiceId}/send-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: email,
            subject: "Invoice from Tadeo Invoices",
            message:
              "Your invoice is ready. You can review it and pay securely using the link below.",
          }),
        }
      );

      const text = await response.text();
      console.log("RAW EMAIL RESPONSE:", text);

      let result: any;

      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(
          "The API returned HTML instead of JSON. Wrong route or not deployed."
        );
      }

      if (!response.ok) {
        throw new Error(result.error || "Email could not be sent.");
      }

      setMessage("Email sent successfully ✅");
    } catch (error: any) {
      console.error("SEND_EMAIL_BUTTON_ERROR:", error);
      setMessage(error?.message || "Error sending email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleSend}
        disabled={loading || !email}
        className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send Email"}
      </button>

      {message && (
        <p className="text-sm text-slate-300">{message}</p>
      )}

      {!email && (
        <p className="text-sm text-red-300">
          This invoice has no client email.
        </p>
      )}
    </div>
  );
}