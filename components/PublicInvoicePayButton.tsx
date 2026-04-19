"use client";

import { useState } from "react";

export default function PublicInvoicePayButton({
  token,
  disabled,
}: {
  token: string;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    try {
      setLoading(true);

      const res = await fetch("/api/invoices/public-pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "No se pudo iniciar el pago.");
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("PUBLIC_PAY_BUTTON_ERROR", error);
      alert("Ocurrió un error al abrir Stripe.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePay}
      disabled={disabled || loading}
      style={{
        background: disabled ? "#94a3b8" : "#25569d",
        color: "#fff",
        border: "none",
        borderRadius: "12px",
        padding: "14px 18px",
        fontSize: "15px",
        fontWeight: 700,
        cursor: disabled || loading ? "not-allowed" : "pointer",
      }}
    >
      {disabled ? "Factura pagada" : loading ? "Abriendo Stripe..." : "Pagar factura"}
    </button>
  );
}