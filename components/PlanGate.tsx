import Link from "next/link";

type PlanName = "starter" | "pro" | "business";

type PlanGateProps = {
  currentPlan: string | null | undefined;
  requiredPlan: PlanName;
  children: React.ReactNode;
  title?: string;
  description?: string;
};

const planRank: Record<PlanName, number> = {
  starter: 1,
  pro: 2,
  business: 3,
};

function normalizePlan(plan: string | null | undefined): PlanName | null {
  if (!plan) return null;

  const value = plan.toLowerCase();

  if (value === "starter" || value === "pro" || value === "business") {
    return value;
  }

  return null;
}

function hasAccess(currentPlan: string | null | undefined, requiredPlan: PlanName) {
  const normalized = normalizePlan(currentPlan);

  if (!normalized) return false;

  return planRank[normalized] >= planRank[requiredPlan];
}

export default function PlanGate({
  currentPlan,
  requiredPlan,
  children,
  title,
  description,
}: PlanGateProps) {
  const allowed = hasAccess(currentPlan, requiredPlan);

  if (allowed) {
    return <>{children}</>;
  }

  const labels: Record<PlanName, string> = {
    starter: "Starter",
    pro: "Pro",
    business: "Business",
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "28px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        border: "1px solid #e6e9ee",
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: "10px",
          fontSize: "24px",
          color: "#111",
        }}
      >
        {title || `Disponible solo en el plan ${labels[requiredPlan]}`}
      </h3>

      <p
        style={{
          color: "#666",
          fontSize: "16px",
          lineHeight: 1.6,
          marginBottom: "18px",
        }}
      >
        {description ||
          `Actualiza tu membresía para usar esta función. Esta sección requiere el plan ${labels[requiredPlan]} o superior.`}
      </p>

      <Link
        href="/membresias"
        style={{
          display: "inline-block",
          background: "#25569d",
          color: "#fff",
          padding: "12px 18px",
          borderRadius: "10px",
          fontSize: "15px",
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        Ver planes
      </Link>
    </div>
  );
}