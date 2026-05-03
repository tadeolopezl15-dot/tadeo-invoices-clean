"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function EmailPage() {
  const params = useParams();
  const id = params.id as string;

  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState("Invoice from Tadeo Invoices");
  const [message, setMessage] = useState(
    "Hello,\n\nPlease find your invoice attached.\n\nThank you."
  );

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ FUNCIÓN ARREGLADA (NO MÁS ERROR JSON)
  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!toEmail.trim()) {
      setError("Enter the client email.");
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

      const text = await res.text();

      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("EMAIL_RESPONSE_NOT_JSON:", text);

        throw new Error(
          "The email API is not returning JSON. Check backend route."
        );
      }

      if (!res.ok) {
        throw new Error(
          data?.error || "The email could not be sent."
        );
      }

      setSuccess("Email sent successfully with PDF attached.");
    } catch (err: any) {
      console.error("SEND_EMAIL_ERROR:", err);
      setError(err.message || "Error sending email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl">

        {/* HEADER */}
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h1 className="text-3xl font-black">Send Invoice</h1>
          <p className="text-slate-400 mt-2">
            Send this invoice to your client with PDF attached.
          </p>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-500/20 p-4 text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl bg-green-500/20 p-4 text-green-300">
            {success}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSend} className="space-y-4">

          <input
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            placeholder="Client email"
            className="w-full rounded-xl border border-white/10 bg-[#020617] px-4 py-3"
          />

          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#020617] px-4 py-3"
          />

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full rounded-xl border border-white/10 bg-[#020617] px-4 py-3"
          />

          <button
            disabled={sending}
            className="w-full rounded-xl bg-cyan-400 px-6 py-3 font-black text-black"
          >
            {sending ? "Sending..." : "Send Email"}
          </button>

        </form>
      </div>
    </main>
  );
}