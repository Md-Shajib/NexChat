import { ApiError, toApiError } from "./api-error";

type ErrorContext = {
  /** Where the error happened, e.g. "chat.sendMessage". */
  scope: string;
  /** Extra breadcrumbs for the log sink. */
  meta?: Record<string, unknown>;
};

/**
 * Central error sink. Errors are never swallowed: they are normalised, logged,
 * and turned into a message that is safe to show a user.
 *
 * In a real deployment `report` would forward to Sentry/Datadog; here it logs
 * with a stable prefix so the console stays greppable.
 */
export function reportError(error: unknown, context: ErrorContext): ApiError {
  const apiError = toApiError(error);

  // Expected, user-driven failures (a validation error on a form) are noise at
  // error level — they are already surfaced in the UI.
  const level = apiError.isValidation ? "warn" : "error";

  console[level](`[next-chat:${context.scope}]`, {
    message: apiError.message,
    code: apiError.code,
    status: apiError.status,
    details: apiError.details,
    ...context.meta,
  });

  return apiError;
}

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

/**
 * A message fit for a toast or inline banner.
 *
 * Server-side 500s leak implementation detail (the API returns raw Mongoose
 * cast errors), so those are replaced with a generic line.
 */
export function getUserFacingMessage(error: unknown): string {
  const apiError = toApiError(error);

  if (apiError.isNetwork) return apiError.message;
  if (apiError.isUnauthorized) return "Your session has expired. Please log in again.";
  if (apiError.status !== null && apiError.status >= 500) return FALLBACK_MESSAGE;

  return apiError.message || FALLBACK_MESSAGE;
}
