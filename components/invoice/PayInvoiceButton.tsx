"use client";

import { useState } from "react";

type PayInvoiceButtonProps = {
  invoiceId: string;
  className?: string;
};

export default function PayInvoiceButton({
  invoiceId,
  className = "",
}: PayInvoiceButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "No se pudo iniciar el pago");
      }

      if (!data?.url) {
        throw new Error("Stripe no devolvió una URL de pago");
      }

      window.location.href = data.url;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo iniciar el pago";
      setError(message);
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        className={`group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#0f172a,#111827,#1e293b)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.28)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_rgba(15,23,42,0.36)] focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:translate-y-0 ${className}`}
      >
        {loading ? (
          <>
            <Spinner />
            Redirigiendo al pago...
          </>
        ) : (
          <>
            <CreditCardIcon />
            Pagar factura
            <span className="transition group-hover:translate-x-0.5">→</span>
          </>
        )}
      </button>

      {error ? (
        <div className="mt-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-medium text-red-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h2" />
      <path d="M10 15h4" />
    </svg>
  );
}