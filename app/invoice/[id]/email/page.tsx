"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(value || 0));
}

export default function SendInvoiceEmailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [invoice, setInvoice] = useState<any>(null);
  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) return;

    async function loadInvoice() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("LOAD_INVOICE_EMAIL_ERROR", error);
        setError("No se pudo cargar la factura.");
        setLoading(false);
        return;
      }

      setInvoice(data);
      setToEmail(data.client_email || "");
      setSubject(
        `Factura ${data.invoice_number || ""} - ${data.company_name || "Tadeo Invoices"}`
      );

      const publicLink = data.public_token
        ? `${window.location.origin}/public-invoice/${data.public_token}`
        : `${window.location.origin}/invoice/${data.id}`;

      setMessage(`Hola ${data.client_name || ""},

Te envío tu factura ${data.invoice_number || ""}.

Puedes verla aquí:
${publicLink}

Total: ${money(data.total, data.currency || "USD")}

Gracias por tu negocio.

${data.company_name || "Tadeo Invoices"}`);

      setLoading(false);
    }

    loadInvoice();
  }, [id, supabase]);

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!toEmail.trim()) {
      setError("Debes escribir el email del cliente.");
      return;
    }

    try {
      setSending(true);

      const res = await fetch(`/api/invoices/${id}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: toEmail.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json?.error?.message ||
            json?.error ||
            "No se pudo enviar el email."
        );
      }

      setSuccess("Email enviado correctamente con PDF adjunto.");
    } catch (err: any) {
      console.error("SEND_EMAIL_ERROR", err);
      setError(err?.message || "Error enviando el email.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          Cargando factura...
        </div>
      </main>
    );
  }

  if (!invoice) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <h1 className="text-2xl font-black">Factura no encontrada</h1>
          <Link
            href="/invoice"
            className="mt-5 inline-flex rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-300"
          >
            Volver a facturas
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
          <p className="text-sm font-semibold text-cyan-300">
            Tadeo Invoices
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Enviar factura por email
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Factura #{invoice.invoice_number || "Sin número"} · Total{" "}
            <span className="font-bold text-cyan-300">
              {money(invoice.total, invoice.currency || "USD")}
            </span>
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSend}
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl"
        >
          <div className="grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Para
              </label>
              <input
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                type="email"
                placeholder="cliente@email.com"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Asunto
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Factura INV-001"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Mensaje
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[230px] w-full resize-none rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <button
              disabled={sending}
              className="rounded-2xl bg-cyan-400 px-5 py-4 font-black text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? "Enviando..." : "Enviar con PDF"}
            </button>

            <Link
              href={`/api/invoices/${id}/pdf`}
              target="_blank"
              className="rounded-2xl border border-purple-400/30 bg-purple-400/10 px-5 py-4 text-center font-bold text-purple-200 hover:bg-purple-400/20"
            >
              Ver PDF
            </Link>

            <button
              type="button"
              onClick={() => router.push(`/invoice/${id}`)}
              className="rounded-2xl border border-white/10 px-5 py-4 font-bold text-white hover:bg-white/10"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}