"use client";

import * as React from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(Number(value || 0));
}

type InvoiceSummary = {
  id: string;
  invoice_number?: string;
  number?: string;
  total: number;
  currency: string;
  client_name?: string;
  client_email?: string;
};

function CheckoutForm({
  token,
  invoice,
}: {
  token: string;
  invoice: InvoiceSummary | null;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!stripe || !elements) {
      setMessage("Stripe aún no está listo.");
      return;
    }

    setLoading(true);
    setMessage("");

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/public-invoice/${token}?success=1`,
      },
      redirect: "if_required",
    });

    if (result.error) {
      setMessage(result.error.message || "No se pudo procesar el pago.");
      setLoading(false);
      return;
    }

    if (result.paymentIntent?.status === "succeeded") {
      window.location.href = `/public-invoice/${token}?success=1`;
      return;
    }

    if (result.paymentIntent?.status === "processing") {
      setMessage("Tu pago está en procesamiento.");
      setLoading(false);
      return;
    }

    setMessage("Se confirmó el pago. Verificando estado...");
    setLoading(false);
  }

  const invoiceLabel = invoice?.invoice_number || invoice?.number || "—";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 md:p-5 shadow-sm">
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements || loading}
        className="w-full rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Procesando pago..."
          : `Pagar ${money(invoice?.total || 0, invoice?.currency || "USD")}`}
      </button>

      {message ? (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
          {message}
        </div>
      ) : null}
    </form>
  );
}

export default function PublicInvoicePayPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = React.use(params);

  const [clientSecret, setClientSecret] = React.useState("");
  const [invoice, setInvoice] = React.useState<InvoiceSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let mounted = true;

    async function boot() {
      try {
        const res = await fetch("/api/stripe/pay-invoice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (!mounted) return;
          setError(data.error || "No se pudo preparar el pago.");
          setLoading(false);
          return;
        }

        if (!mounted) return;

        setClientSecret(data.clientSecret || "");
        setInvoice(data.invoice || null);
        setLoading(false);
      } catch (err) {
        console.error("PUBLIC_PAY_PAGE_ERROR", err);
        if (!mounted) return;
        setError("Ocurrió un error cargando el pago.");
        setLoading(false);
      }
    }

    boot();

    return () => {
      mounted = false;
    };
  }, [token]);

  const options = React.useMemo(() => {
    if (!clientSecret) return undefined;

    return {
      clientSecret,
      appearance: {
        theme: "stripe" as const,
      },
    };
  }, [clientSecret]);

  const invoiceLabel = invoice?.invoice_number || invoice?.number || "—";

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-zinc-500">
              Cargando formulario de pago seguro...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
            <p className="text-lg font-semibold text-zinc-900">
              Pago no disponible
            </p>
            <p className="mt-2 text-sm text-zinc-600">{error}</p>

            <Link
              href={`/public-invoice/${token}`}
              className="mt-5 inline-flex rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Volver a la factura
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Pago seguro
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
                Pagar factura
              </h1>
              <p className="mt-2 text-sm text-zinc-600">
                Completa el pago con el formulario seguro de Stripe.
              </p>
            </div>

            <Link
              href={`/public-invoice/${token}`}
              className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Ver factura
            </Link>
          </div>

          <div className="mt-8 grid gap-4 rounded-3xl border border-zinc-200 bg-zinc-50 p-5 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Número de factura
              </p>
              <p className="mt-1 text-base font-semibold text-zinc-900">
                {invoiceLabel}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Monto a pagar
              </p>
              <p className="mt-1 text-base font-semibold text-zinc-900">
                {money(invoice?.total || 0, invoice?.currency || "USD")}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Cliente
              </p>
              <p className="mt-1 text-base font-semibold text-zinc-900">
                {invoice?.client_name || "Customer"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Email
              </p>
              <p className="mt-1 break-all text-base font-semibold text-zinc-900">
                {invoice?.client_email || "—"}
              </p>
            </div>
          </div>

          <div className="mt-8">
            {clientSecret && options ? (
              <Elements stripe={stripePromise} options={options}>
                <CheckoutForm token={token} invoice={invoice} />
              </Elements>
            ) : (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
                No se pudo inicializar el formulario de pago.
              </div>
            )}
          </div>
        </section>

        <aside className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-zinc-900">
            Detalles del pago
          </h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-zinc-200 p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Total
              </p>
              <p className="mt-1 text-2xl font-bold text-zinc-900">
                {money(invoice?.total || 0, invoice?.currency || "USD")}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 p-4">
              <p className="text-sm font-semibold text-zinc-900">
                Pago protegido
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                Tus datos de pago se procesan de forma segura con Stripe.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 p-4">
              <p className="text-sm font-semibold text-zinc-900">
                Métodos aceptados
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                Tarjetas y los métodos de pago habilitados en Stripe.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 p-4">
              <p className="text-sm font-semibold text-zinc-900">
                ¿Quieres revisar la factura primero?
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                Puedes ver los detalles antes de completar el pago.
              </p>

              <Link
                href={`/public-invoice/${token}`}
                className="mt-3 inline-flex rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Abrir factura
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}