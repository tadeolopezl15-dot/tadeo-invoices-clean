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

      // Redirigir al listado de facturas
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
      className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-white px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Eliminando..." : label}
    </button>
  );
}