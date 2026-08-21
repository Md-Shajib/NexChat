import { z } from "zod";

import { appConfig } from "@/config/app-config";

/**
 * The composer's contract.
 *
 * `.trim()` runs before `.min(1)`, which is what makes a whitespace-only
 * message unsendable — the requirement the API itself does not enforce.
 */
export const sendMessageSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Type a message first")
    .max(
      appConfig.chat.maxMessageLength,
      `Messages are limited to ${appConfig.chat.maxMessageLength} characters`,
    ),
});

export type SendMessageFormValues = z.input<typeof sendMessageSchema>;
export type SendMessageFormOutput = z.output<typeof sendMessageSchema>;
