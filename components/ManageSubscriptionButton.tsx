"use client";

import { useState } from "react";

export default function ManageSubscriptionButton({
  userId,
}: {
  userId: string;
}) {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    try {
      setLoading(true);

      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "No se pudo abrir el portal.");
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al abrir el portal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={openPortal}
      disabled={loading}
      style={{
        background: "#25569d",
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        padding: "12px 18px",
        fontSize: "16px",
        fontWeight: 700,
        cursor: "pointer",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? "Abriendo..." : "Gestionar suscripción"}
    </button>
  );
}