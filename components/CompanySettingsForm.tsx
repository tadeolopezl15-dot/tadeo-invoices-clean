"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import type { Profile } from "@/lib/types";

type Props = {
  profile: Profile | null;
};

export function CompanySettingsForm({ profile }: Props) {
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [companyName, setCompanyName] = useState(profile?.company_name || "");
  const [companyEmail, setCompanyEmail] = useState(profile?.company_email || "");
  const [companyPhone, setCompanyPhone] = useState(profile?.company_phone || "");
  const [companyAddress, setCompanyAddress] = useState(profile?.company_address || "");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = createBrowserSupabaseClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("No se pudo validar la sesión.");
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          company_name: companyName,
          company_email: companyEmail,
          company_phone: companyPhone,
          company_address: companyAddress,
        })
        .eq("id", user.id);

      if (error) {
        alert(error.message);
        setSaving(false);
        return;
      }

      alert("Datos de empresa guardados correctamente.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error inesperado";
      alert(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSave}>
      <p className="section-kicker">Datos de empresa</p>
      <h2 style={{ marginTop: 10 }}>Información comercial</h2>
      <p className="muted">
        Estos datos podrán usarse automáticamente en tus invoices y PDFs.
      </p>

      <div className="grid-two" style={{ marginTop: 20 }}>
        <label>
          <span>Nombre del propietario</span>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre"
          />
        </label>

        <label>
          <span>Nombre de empresa</span>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Tu empresa"
          />
        </label>

        <label>
          <span>Email de empresa</span>
          <input
            type="email"
            value={companyEmail}
            onChange={(e) => setCompanyEmail(e.target.value)}
            placeholder="empresa@email.com"
          />
        </label>

        <label>
          <span>Teléfono</span>
          <input
            value={companyPhone}
            onChange={(e) => setCompanyPhone(e.target.value)}
            placeholder="(000) 000-0000"
          />
        </label>
      </div>

      <label>
        <span>Dirección</span>
        <textarea
          rows={4}
          value={companyAddress}
          onChange={(e) => setCompanyAddress(e.target.value)}
          placeholder="Dirección comercial"
        />
      </label>

      <div style={{ marginTop: 8 }}>
        <button type="submit" className="blue-btn" disabled={saving}>
          {saving ? "Guardando..." : "Guardar información"}
        </button>
      </div>
    </form>
  );
}