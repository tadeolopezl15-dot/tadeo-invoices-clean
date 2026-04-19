"use client";

import { useState, useTransition } from "react";

type Props = {
  currentLogoUrl?: string | null;
  userId: string;
};

export default function CompanyLogoUpload({ currentLogoUrl, userId }: Props) {
  const [preview, setPreview] = useState<string>(currentLogoUrl || "");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  async function handleUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    startTransition(async () => {
      setMessage("");

      const res = await fetch("/api/settings/upload-logo", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        setMessage(json.error || "No se pudo subir el logo");
        return;
      }

      setPreview(json.logoUrl);
      setMessage("Logo actualizado");
    });
  }

  return (
    <div className="rounded-2xl border border-neutral-200 p-4">
      <label className="mb-2 block text-sm font-medium text-neutral-700">
        Logo de la empresa
      </label>

      {preview ? (
        <img
          src={preview}
          alt="Logo actual"
          className="mb-4 h-20 w-auto rounded-xl border border-neutral-200 bg-white p-2"
        />
      ) : (
        <div className="mb-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-500">
          No hay logo cargado
        </div>
      )}

      <input
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
        className="block w-full text-sm"
      />

      {isPending ? <p className="mt-2 text-sm text-neutral-500">Subiendo...</p> : null}
      {message ? <p className="mt-2 text-sm text-neutral-600">{message}</p> : null}
    </div>
  );
}