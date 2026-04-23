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
  const [companyAddress, setCompanyAddress] = useState(initialData.company_address);
  const [logoUrl, setLogoUrl] = useState(initialData.logo_url);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("No autorizado");
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

          <label className="ui-label mt-4">Logo URL</label>
          <input
            className="ui-input"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://..."
          />

          {logoUrl ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt="Logo preview"
                className="max-h-20 w-auto object-contain"
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>

        {message ? (
          <p className={`text-sm ${isError ? "text-rose-600" : "text-emerald-600"}`}>
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}