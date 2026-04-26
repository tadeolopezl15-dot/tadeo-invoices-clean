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
  canUseLogo,
}: {
  initialData: InitialData;
  canUseLogo: boolean;
}) {
  const [companyName, setCompanyName] = useState(initialData.company_name);
  const [companyEmail, setCompanyEmail] = useState(initialData.company_email);
  const [companyPhone, setCompanyPhone] = useState(initialData.company_phone);
  const [companyAddress, setCompanyAddress] = useState(
    initialData.company_address
  );
  const [logoUrl, setLogoUrl] = useState(initialData.logo_url);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
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
        throw new Error(data?.error || "No se pudo subir el logo");
      }

      setLogoUrl(data.logoUrl);
      setLogoFile(null);
      setMessage("Logo actualizado correctamente.");
      setIsError(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error subiendo logo");
      setIsError(true);
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No autorizado");
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          company_name: companyName || null,
          company_email: companyEmail || null,
          company_phone: companyPhone || null,
          company_address: companyAddress || null,
          logo_url: canUseLogo ? logoUrl || null : null,
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      setMessage("Configuración guardada correctamente.");
      setIsError(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="ui-card p-6 md:p-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="ui-panel">
          <label className="ui-label">Empresa</label>
          <input
            className="ui-input"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Tu empresa"
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
        </div>

        <div className="ui-panel">
          <label className="ui-label">Dirección</label>
          <textarea
            className="ui-textarea min-h-[140px]"
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
            placeholder="Dirección de la empresa"
          />

          <div className="mt-5">
            <label className="ui-label">Logo de la empresa</label>

            {canUseLogo ? (
              <>
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
                  {logoUrl ? (
                    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logoUrl}
                        alt="Logo actual"
                        className="max-h-24 w-auto object-contain"
                      />
                    </div>
                  ) : (
                    <p className="mb-4 text-sm text-slate-500">
                      Todavía no tienes logo.
                    </p>
                  )}

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                  />

                  <button
                    type="button"
                    onClick={uploadLogo}
                    disabled={uploadingLogo || !logoFile}
                    className="btn btn-primary mt-4"
                  >
                    {uploadingLogo ? "Subiendo..." : "Cambiar logo"}
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-700">
                  Logo disponible solo en Pro o Business.
                </p>
                <a href="/pricing" className="btn btn-primary mt-4">
                  Upgrade
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Guardando..." : "Guardar cambios"}
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