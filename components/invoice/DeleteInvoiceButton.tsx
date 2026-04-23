"use client";

import { useState } from "react";

export default function DeleteInvoiceButton({
  invoiceId,
  label = "Eliminar",
  confirmText = "¿Seguro que deseas eliminar esta factura?",
}: {
  invoiceId: string;
  label?: string;
  confirmText?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const ok = window.confirm(confirmText);
    if (!ok) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/invoices/${invoiceId}/delete`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("No se pudo eliminar");
      }

      window.location.href = "/invoice";
    } catch (error) {
      alert("Error eliminando la factura");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="ui-btn ui-btn-danger"
    >
      {loading ? "Eliminando..." : label}
    </button>
  );
}