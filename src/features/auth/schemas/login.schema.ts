import { z } from "zod";

import { isValidPhone, normalisePhone } from "@/shared/utils/phone";

/**
 * Login form contract.
 *
 * The API only checks that both fields are *present*, so all meaningful
 * validation lives here. The phone is normalised before validation so that
 * `0170 000 0002` and `+8801700000002` cannot become two accounts.
 */
export const loginSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(1, "Enter your phone number")
    .transform(normalisePhone)
    .refine(isValidPhone, "Enter a valid number in international format, e.g. +8801700000000"),

  name: z
    .string()
    .trim()
    .min(2, "Your name needs at least 2 characters")
    .max(50, "Keep your name under 50 characters"),
});

export type LoginFormValues = z.input<typeof loginSchema>;
export type LoginFormOutput = z.output<typeof loginSchema>;
