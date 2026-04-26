"use client";

import { useState } from "react";

type Props = {
  canUseLogo?: boolean;
  initialData: {
    company_name?: string;
    company_email?: string;
    company_phone?: string;
    company_address?: string;
    logo_url?: string;
  };
};

export default function CompanySettingsForm({
  initialData,
  canUseLogo = true,
}: Props) {
  const [logoUrl, setLogoUrl] = useState(initialData.logo_url || "");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function uploadLogo() {
    if (!canUseLogo) return alert("Logo disponible solo para planes Pro.");
    if (!file) return alert("Selecciona una imagen");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("logo", file);

      const res = await fetch("/api/settings/upload-logo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error subiendo logo");
        return;
      }

      setLogoUrl(data.logoUrl);
      setFile(null);
      alert("Logo actualizado");
    } catch (err) {
      console.error(err);
      alert("Error subiendo logo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ui-card p-6 md:p-8">
      <h2 className="text-xl font-bold mb-4">Logo de la empresa</h2>

      {logoUrl ? (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt="Logo actual"
            className="max-h-32 w-auto object-contain"
          />
        </div>
      ) : (
        <div className="mb-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
          Todavía no tienes logo.
        </div>
      )}

      <input
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
      />

      {file ? (
        <p className="mt-3 text-xs text-slate-500">
          Archivo seleccionado: {file.name}
        </p>
      ) : null}

      <button
        type="button"
        onClick={uploadLogo}
        disabled={loading || !file}
        className="btn btn-primary mt-4"
      >
        {loading ? "Subiendo..." : "Subir nuevo logo"}
      </button>
    </div>
  );
}