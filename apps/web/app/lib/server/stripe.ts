import Stripe from "stripe";

export function getStripeClient() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return null;

  return new Stripe(secret, {
    apiVersion: "2024-06-20",
  });
}
