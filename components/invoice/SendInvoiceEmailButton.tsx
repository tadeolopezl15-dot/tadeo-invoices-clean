"use client";

import { useState } from "react";

export default function SendInvoiceEmailButton({
  invoiceId,
  label = "Enviar email",
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
  const [isError, setIsError] = useState(false);

  async function handleSend() {
    try {
      setLoading(true);
      setMessage("");
      setIsError(false);

      const res = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || errorLabel);
      }

      setMessage(successLabel);
      setIsError(false);
    } catch (error) {
      const text = error instanceof Error ? error.message : errorLabel;
      setMessage(text);
      setIsError(true);
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
        className="btn btn-secondary"
      >
        {loading ? "..." : label}
      </button>

      {message ? (
        <p className={`text-xs ${isError ? "text-rose-600" : "text-emerald-600"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}