"use client";

import { useState } from "react";

export default function PayInvoiceButton({
  invoiceId,
  label = "Pagar factura",
}: {
  invoiceId: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);

    const res = await fetch("/api/stripe/pay-invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ invoiceId }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "No se pudo abrir Stripe");
      setLoading(false);
      return;
    }

    window.location.href = data.url;
  }

  return (
    <button
      type="button"
      onClick={pay}
      disabled={loading}
      className="btn btn-primary"
    >
      {loading ? "Abriendo pago..." : label}
    </button>
  );
}