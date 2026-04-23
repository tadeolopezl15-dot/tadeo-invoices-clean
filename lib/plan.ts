export type Plan = "starter" | "pro" | "business";

export function canSendEmail(plan: Plan) {
  return plan === "pro" || plan === "business";
}

export function canUseLogo(plan: Plan) {
  return plan === "pro" || plan === "business";
}

export function invoiceLimit(plan: Plan) {
  if (plan === "starter") return 5;
  if (plan === "pro") return 50;
  return Infinity;
}