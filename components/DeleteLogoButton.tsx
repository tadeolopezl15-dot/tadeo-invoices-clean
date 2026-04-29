"use client";

import { useState } from "react";

export default function DeleteLogoButton() {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmDelete = confirm(
      "¿Seguro que quieres eliminar el logo? Esta acción no se puede deshacer."
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);

      const res = await fetch("/api/settings/delete-logo", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Error eliminando logo");
      }

      // recarga para actualizar UI
      window.location.reload();
    } catch (err: any) {
      alert(err.message || "No se pudo eliminar el logo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="flex h-12 items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-5 text-sm font-bold text-red-600 shadow-sm transition hover:bg-red-100 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Eliminando..." : "Eliminar logo"}
    </button>
  );
}