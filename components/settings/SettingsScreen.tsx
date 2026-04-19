"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

type Lang = "es" | "en";

type SettingsScreenProps = {
  action: (formData: FormData) => void | Promise<void>;
  user: {
    fullName: string;
    companyName: string;
    logoUrl?: string;
    email: string;
  };
};

const copy = {
  es: {
    title: "Configuración",
    subtitle: "Perfil y marca del negocio",
    fullName: "Nombre completo",
    companyName: "Empresa",
    logoUrl: "URL del logo",
    email: "Correo",
    save: "Guardar cambios",
    saving: "Guardando...",
    logoHelp: "Pega una URL pública de tu logo para usarla en el PDF.",
  },
  en: {
    title: "Settings",
    subtitle: "Business profile and branding",
    fullName: "Full name",
    companyName: "Company",
    logoUrl: "Logo URL",
    email: "Email",
    save: "Save changes",
    saving: "Saving...",
    logoHelp: "Paste a public logo URL to use it in the PDF.",
  },
} as const;

export default function SettingsScreen({
  action,
  user,
}: SettingsScreenProps) {
  const [lang, setLang] = useState<Lang>("es");

  useEffect(() => {
    const saved = localStorage.getItem("app_lang") as Lang | null;
    if (saved === "en" || saved === "es") setLang(saved);
  }, []);

  const t = useMemo(() => copy[lang], [lang]);

  return (
    <main className="min-h-screen bg-[#020617] p-6 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">
            {t.subtitle}
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{t.title}</h1>

          <form action={action} className="mt-6 space-y-5">
            <Field
              label={t.fullName}
              name="full_name"
              defaultValue={user.fullName}
            />

            <Field
              label={t.companyName}
              name="company_name"
              defaultValue={user.companyName}
            />

            <Field label={t.email} name="email_readonly" defaultValue={user.email} disabled />

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">
                {t.logoUrl}
              </label>
              <input
                name="logo_url"
                defaultValue={user.logoUrl || ""}
                placeholder="https://..."
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
              />
              <p className="text-sm text-white/50">{t.logoHelp}</p>
            </div>

            <SubmitButton save={t.save} saving={t.saving} />
          </form>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  defaultValue,
  disabled = false,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white/80">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none disabled:opacity-60"
      />
    </div>
  );
}

function SubmitButton({
  save,
  saving,
}: {
  save: string;
  saving: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a,#111827,#1e293b)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.28)] transition hover:-translate-y-0.5 disabled:opacity-70"
    >
      {pending ? saving : save}
    </button>
  );
}