"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Invoice = {
  id: string;
  invoice_number: string | null;
  company_name: string | null;
  company_email: string | null;
  total: number | null;
  currency: string | null;
};

function money(value: number | null | undefined, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(value || 0));
}

export default function EmailInvoicePage() {
  const params = useParams();
  const router = useRouter();

  const invoiceId = String(params.id || "");

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState(
    "Your invoice is ready. You can review it and pay securely using the link below."
  );

  const [loadingInvoice, setLoadingInvoice] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    async function loadInvoice() {
      try {
        setLoadingInvoice(true);

        const response = await fetch(`/api/invoices/${invoiceId}`, {
          cache: "no-store",
        });

        const text = await response.text();
        console.log("LOAD INVOICE RAW RESPONSE:", text);

        let result: any;

        try {
          result = JSON.parse(text);
        } catch {
          throw new Error(
            "The invoice API returned HTML instead of JSON. Check /api/invoices/[id]."
          );
        }

        if (!response.ok) {
          throw new Error(result.error || "Invoice could not be loaded.");
        }

        const loadedInvoice = result.invoice || result.data || result;

        setInvoice(loadedInvoice);
        setTo(loadedInvoice.company_email || "");
        setSubject(
          `Invoice ${loadedInvoice.invoice_number || loadedInvoice.id}`
        );
      } catch (error: any) {
        console.error("LOAD_INVOICE_FOR_EMAIL_ERROR:", error);
        setStatusMessage(error?.message || "Error loading invoice.");
      } finally {
        setLoadingInvoice(false);
      }
    }

    if (invoiceId) {
      loadInvoice();
    }
  }, [invoiceId]);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSending(true);
      setStatusMessage("");

      if (!invoiceId) {
        throw new Error("Missing invoice ID.");
      }

      if (!to.trim()) {
        throw new Error("Client email is required.");
      }

      const response = await fetch(`/api/invoices/${invoiceId}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: to.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const text = await response.text();
      console.log("SEND EMAIL RAW RESPONSE:", text);

      let result: any;

      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(
          "The email API returned HTML instead of JSON. The page was calling the wrong route or the deploy is outdated."
        );
      }

      if (!response.ok) {
        throw new Error(result.error || "Email could not be sent.");
      }

      setStatusMessage("Email sent successfully ✅");

      setTimeout(() => {
        router.push(`/invoice/${invoiceId}`);
        router.refresh();
      }, 900);
    } catch (error: any) {
      console.error("SEND_INVOICE_EMAIL_PAGE_ERROR:", error);
      setStatusMessage(error?.message || "Error sending email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] px-6 py-8 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/invoice/${invoiceId}`}
          className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-blue-200 hover:bg-white/10"
        >
          ← Back to invoice
        </Link>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-300">
            Tadeo Invoices
          </p>

          <h1 className="mt-4 text-4xl font-black">Send Invoice Email</h1>

          <p className="mt-3 text-slate-400">
            Send this invoice using the secure email route.
          </p>

          {loadingInvoice ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5 text-slate-300">
              Loading invoice...
            </div>
          ) : null}

          {invoice ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm text-slate-400">Invoice</p>
              <h2 className="mt-1 text-2xl font-black">
                {invoice.invoice_number || invoice.id}
              </h2>

              <p className="mt-2 text-slate-400">
                {invoice.company_name || "Unnamed client"} ·{" "}
                {invoice.company_email || "No email"}
              </p>

              <p className="mt-4 text-3xl font-black">
                {money(invoice.total, invoice.currency || "USD")}
              </p>
            </div>
          ) : null}

          <form onSubmit={handleSend} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-bold text-slate-300">
                Send To
              </label>
              <input
                type="email"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                placeholder="client@example.com"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:ring-4 focus:ring-blue-500/30"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-300">
                Subject
              </label>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Invoice from Tadeo Invoices"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:ring-4 focus:ring-blue-500/30"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-300">
                Message
              </label>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={5}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:ring-4 focus:ring-blue-500/30"
              />
            </div>

            {statusMessage ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
                {statusMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-2xl bg-blue-500 px-6 py-4 font-black text-white shadow-xl shadow-blue-500/25 hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send Email"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}