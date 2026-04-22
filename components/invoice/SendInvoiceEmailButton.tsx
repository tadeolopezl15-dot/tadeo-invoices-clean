"use client";

import { useState } from "react";

export default function SendInvoiceEmailButton({
  invoiceId,
  label = "Email",
  successLabel = "Email enviado",
  errorLabel = "No se pudo enviar",
}: {
  invoiceId: string;
  label?: string;
  successLabel?: string;
  errorLabel?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSend() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || errorLabel);
      }

      setMessage(successLabel);
    } catch (error) {
      const text = error instanceof Error ? error.message : errorLabel;
      setMessage(text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleSend}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Enviando..." : label}
      </button>

      {message ? <p className="text-xs text-slate-500">{message}</p> : null}
    </div>
  );
}