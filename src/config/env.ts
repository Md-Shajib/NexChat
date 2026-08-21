import { z } from "zod";

/**
 * The single place in the app that is allowed to touch `process.env`.
 *
 * Next.js inlines `NEXT_PUBLIC_*` vars at build time, which means they must be
 * referenced as full static literals — `process.env[key]` does not work. Hence
 * the explicit object below rather than a loop.
 */
const rawEnv = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL,
  apiTimeout: process.env.NEXT_PUBLIC_API_TIMEOUT,
};

const envSchema = z.object({
  apiBaseUrl: z
    .url("NEXT_PUBLIC_API_BASE_URL must be a valid URL")
    .default("https://frontend-task-chatapp.onrender.com/api"),
  socketUrl: z
    .url("NEXT_PUBLIC_SOCKET_URL must be a valid URL")
    .default("https://frontend-task-chatapp.onrender.com"),
  apiTimeout: z.coerce.number().int().positive().default(30_000),
});

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  // Fail loudly at module load rather than with a cryptic network error later.
  throw new Error(
    `Invalid environment configuration:\n${z.prettifyError(parsed.error)}`,
  );
}

export const env = Object.freeze(parsed.data);

export type Env = typeof env;
