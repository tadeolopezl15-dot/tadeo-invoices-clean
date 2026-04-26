"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type InitialData = {
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  logo_url: string;
};

export default function CompanySettingsForm({
  initialData,
}: {
  initialData: InitialData;
}) {
  const [companyName, setCompanyName] = useState(initialData.company_name);
  const [companyEmail, setCompanyEmail] = useState(initialData.company_email);
  const [companyPhone, setCompanyPhone] = useState(initialData.company_phone);
  const [companyAddress, setCompanyAddress] = useState(
    initialData.company_address
  );

  const [logoUrl, setLogoUrl] = useState(initialData.logo_url);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function uploadLogo() {
    if (!logoFile) {
      setMessage("Selecciona un logo primero.");
      setIsError(true);
      return;
    }

    try {
      setUploadingLogo(true);
      setMessage("");
      setIsError(false);

      const formData = new FormData();
      formData.append("logo", logoFile);

      const res = await fetch("/api/settings/upload-logo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "No se pudo subir el logo.");
      }

      setLogoUrl(data.logoUrl);
      setLogoFile(null);
      setMessage("Logo actualizado correctamente.");
      setIsError(false);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Error subiendo logo."
      );
      setIsError(true);
    } finally {
      setUploadingLogo(false);
    }
  }

  async function saveCompanyData(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setIsError(false);

      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("No autorizado.");
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          company_name: companyName || null,
          company_email: companyEmail || null,
          company_phone: companyPhone || null,
          company_address: companyAddress || null,
          logo_url: logoUrl || null,
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      setMessage("Datos guardados correctamente.");
      setIsError(false);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "No se pudo guardar."
      );
      setIsError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={saveCompanyData} className="ui-card p-6 md:p-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="ui-panel">
          <h2 className="mb-5 text-xl font-bold text-slate-950">
            Datos de empresa
          </h2>

          <label className="ui-label">Empresa</label>
          <input
            className="ui-input"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Nombre de tu empresa"
          />

          <label className="ui-label mt-4">Correo</label>
          <input
            className="ui-input"
            value={companyEmail}
            onChange={(e) => setCompanyEmail(e.target.value)}
            placeholder="correo@empresa.com"
          />

          <label className="ui-label mt-4">Teléfono</label>
          <input
            className="ui-input"
            value={companyPhone}
            onChange={(e) => setCompanyPhone(e.target.value)}
            placeholder="+1 ..."
          />

          <label className="ui-label mt-4">Dirección</label>
          <textarea
            className="ui-textarea min-h-[140px]"
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
            placeholder="Dirección de la empresa"
          />
        </div>

        <div className="ui-panel">
          <h2 className="mb-5 text-xl font-bold text-slate-950">
            Logo de la empresa
          </h2>

          {logoUrl ? (
            <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt="Logo actual"
                className="max-h-32 w-auto object-contain"
              />
            </div>
          ) : (
            <div className="mb-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-500">
              Todavía no tienes logo.
            </div>
          )}

          <label className="ui-label">Seleccionar nuevo logo</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />

          {logoFile ? (
            <p className="mt-3 text-xs text-slate-500">
              Archivo seleccionado: {logoFile.name}
            </p>
          ) : null}

          <button
            type="button"
            onClick={uploadLogo}
            disabled={uploadingLogo || !logoFile}
            className="btn btn-primary mt-5 w-full"
          >
            {uploadingLogo ? "Subiendo..." : "Subir nuevo logo"}
          </button>

          <p className="mt-4 text-xs leading-6 text-slate-500">
            Puedes subir PNG, JPG, JPEG o WEBP. El nuevo logo reemplaza el
            anterior automáticamente.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={saving} className="btn btn-secondary">
          {saving ? "Guardando..." : "Guardar datos"}
        </button>

        {message ? (
          <p
            className={`text-sm ${
              isError ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}