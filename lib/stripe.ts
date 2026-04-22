import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripe = stripeInstance;

export function getStripe() {
  return stripeInstance;
}