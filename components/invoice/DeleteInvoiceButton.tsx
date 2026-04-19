"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DeleteInvoiceButtonProps = {
  invoiceId: string;
  redirectTo?: string;
};

export default function DeleteInvoiceButton({
  invoiceId,
  redirectTo = "/invoice",
}: DeleteInvoiceButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    const ok = window.confirm(
      "¿Seguro que quieres eliminar esta factura? Esta acción no se puede deshacer."
    );

    if (!ok) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/invoices/${invoiceId}/delete`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "No se pudo eliminar la factura");
      }

      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar la factura");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
    >
      {loading ? "Eliminando..." : "Eliminar"}
    </button>
  );
}