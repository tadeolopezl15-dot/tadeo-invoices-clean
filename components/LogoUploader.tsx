"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  currentLogoUrl?: string | null;
};

export default function LogoUploader({ userId, currentLogoUrl }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl || "");
  const [error, setError] = useState("");

  const supabase = createClient();

  async function handleFile(file: File | null) {
    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError("La imagen no puede pesar más de 3MB.");
      return;
    }

    try {
      setUploading(true);

      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${userId}/logo.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(path, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("logos").getPublicUrl(path);

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ logo_url: publicUrl })
        .eq("id", userId);

      if (profileError) {
        throw profileError;
      }

      setLogoUrl(publicUrl);
    } catch (e: any) {
      setError(e?.message || "No se pudo subir el logo.");
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    void handleFile(file);
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-3xl border-2 border-dashed p-6 transition ${
          dragging
            ? "border-cyan-400 bg-cyan-400/10"
            : "border-white/10 bg-white/[0.04] hover:bg-white/[0.06]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            void handleFile(file);
          }}
        />

        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl">
            🖼️
          </div>

          <h3 className="text-lg font-semibold text-white">
            Subir logo de la empresa
          </h3>

          <p className="mt-2 max-w-md text-sm text-slate-400">
            Arrastra una imagen aquí o haz clic para seleccionarla.
          </p>

          <p className="mt-2 text-xs text-slate-500">
            PNG, JPG, WEBP · Máximo 3MB
          </p>
        </div>
      </div>

      {uploading && (
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-300">
          Subiendo logo...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {logoUrl && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <p className="mb-3 text-sm font-medium text-slate-300">Vista previa</p>
          <div className="flex min-h-[120px] items-center justify-center rounded-2xl bg-slate-950/60 p-6">
            <img
              src={logoUrl}
              alt="Logo de empresa"
              className="max-h-24 w-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}