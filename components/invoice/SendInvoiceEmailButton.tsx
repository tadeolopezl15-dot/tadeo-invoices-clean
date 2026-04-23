"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Plan = "starter" | "pro" | "business";

function canSendEmail(plan: Plan) {
  return plan === "pro" || plan === "business";
}

export default function SendInvoiceEmailButton({
  invoiceId,
  label = "Enviar email",
  successLabel = "Email enviado",
  errorLabel = "No se pudo enviar",
}: {
  invoiceId: string;
  label?: string;
  successLabel?: string;
  errorLabel?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [checkingPlan, setCheckingPlan] = useState(true);
  const [plan, setPlan] = useState<Plan>("starter");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function loadPlan() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setPlan("starter");
          return;
        }

        const { data } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", user.id)
          .single();

        setPlan((data?.plan || "starter") as Plan);
      } catch (error) {
        console.error("PLAN_LOAD_ERROR", error);
        setPlan("starter");
      } finally {
        setCheckingPlan(false);
      }
    }

    loadPlan();
  }, []);

  async function handleSend() {
    if (!canSendEmail(plan)) {
      setMessage("Sube a Pro para enviar facturas por email.");
      setIsError(true);
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setIsError(false);

      const res = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || errorLabel);
      }

      setMessage(successLabel);
      setIsError(false);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : errorLabel
      );
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  // ⏳ Cargando plan
  if (checkingPlan) {
    return (
      <button
        type="button"
        disabled
        className="btn btn-secondary opacity-60"
      >
        ...
      </button>
    );
  }

  // 🔒 Bloqueado por plan
  if (!canSendEmail(plan)) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleSend}
          className="btn btn-secondary opacity-80"
        >
          Upgrade to Pro
        </button>

        {message && (
          <p className="text-xs text-rose-600">
            {message}
          </p>
        )}
      </div>
    );
  }

  // ✅ Permitido
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleSend}
        disabled={loading}
        className="btn btn-primary"
      >
        {loading ? "Enviando..." : label}
      </button>

      {message && (
        <p
          className={`text-xs ${
            isError ? "text-rose-600" : "text-emerald-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}