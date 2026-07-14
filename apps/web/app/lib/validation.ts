import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const emailOnlySchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

export const tokenSchema = z.object({
  token: z.string().trim().min(8, "Token is invalid"),
});

export const passwordResetSchema = z.object({
  token: z.string().trim().min(8, "Token is invalid"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
});

export const bookingSchema = z.object({
  from_city: z.string().trim().min(2, "From city is required"),
  to_city: z.string().trim().min(2, "To city is required"),
  travel_date: z.string().trim().min(8, "Travel date is required"),
  travel_type: z.enum(["flight", "train"]),
  platform_name: z.string().trim().min(2, "Platform is required"),
  final_price: z.number().int().positive("Final price must be positive"),
  passengers: z.number().int().min(1).max(9),
  traveller_name: z.string().trim().min(2, "Traveller name is required"),
  traveller_id: z.string().trim().min(6, "Enter a valid traveller ID"),
  payment_method: z.enum(["card"]),
  payment_token: z.string().trim().min(6, "Payment token is required"),
});

export function zodFieldErrors<T extends z.ZodTypeAny>(
  parsed: z.SafeParseReturnType<unknown, z.infer<T>>,
): Record<string, string> {
  if (parsed.success) return {};

  const out: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) {
      out[key] = issue.message;
    }
  }
  return out;
}
