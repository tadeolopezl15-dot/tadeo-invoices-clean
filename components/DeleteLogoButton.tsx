"use client";

import { useState } from "react";

export default function DeleteLogoButton() {
  const [loading, setLoading] = useState(false);

  async function deleteLogo() {
    const ok = confirm("¿Seguro que quieres eliminar el logo?");
    if (!ok) return;

    setLoading(true);

    const res = await fetch("/api/settings/delete-logo", {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "No se pudo eliminar el logo");
      setLoading(false);
      return;
    }

    alert("Logo eliminado correctamente");
    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={deleteLogo}
      disabled={loading}
      className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
    >
      {loading ? "Eliminando..." : "Eliminar logo"}
    </button>
  );
}