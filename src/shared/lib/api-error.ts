import axios from "axios";

import {
  API_ERROR_CODES,
  type ApiErrorBody,
  type ApiErrorCode,
} from "@/types/api";

/**
 * The one error type that crosses the api boundary.
 *
 * Every failure — HTTP, network, or schema — is normalised into this so that
 * hooks and components can branch on `code` instead of poking at Axios
 * internals. Raw `AxiosError` must never escape `features/*\/api`.
 */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number | null;
  readonly details: Array<{ path: string; message: string }>;
  readonly cause?: unknown;

  constructor(params: {
    message: string;
    code: ApiErrorCode;
    status?: number | null;
    details?: Array<{ path: string; message: string }>;
    cause?: unknown;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.code = params.code;
    this.status = params.status ?? null;
    this.details = params.details ?? [];
    this.cause = params.cause;
  }

  /**
   * The session is gone or was never valid.
   *
   * NOTE: the API answers a missing token with **400 NO_TOKEN**, not 401, so a
   * status check alone is not enough — we match on the code too.
   */
  get isUnauthorized(): boolean {
    return (
      this.status === 401 ||
      this.code === API_ERROR_CODES.noToken ||
      this.code === API_ERROR_CODES.invalidToken
    );
  }

  get isValidation(): boolean {
    return this.code === API_ERROR_CODES.validation;
  }

  get isNetwork(): boolean {
    return this.code === API_ERROR_CODES.network;
  }

  /** Worth offering the user a retry button for. */
  get isRetryable(): boolean {
    return this.isNetwork || (this.status !== null && this.status >= 500);
  }

  /** Field-level messages keyed by form field, for react-hook-form. */
  get fieldErrors(): Record<string, string> {
    return Object.fromEntries(this.details.map((d) => [d.path, d.message]));
  }
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== "object" || value === null) return false;
  const { error } = value as Record<string, unknown>;
  return (
    typeof error === "object" &&
    error !== null &&
    typeof (error as Record<string, unknown>).message === "string"
  );
}

/**
 * Coerce the wire `code` to our union.
 *
 * The API returns a numeric MongoDB code (`51091`) for regex-compile failures,
 * so anything that is not one of our known string codes collapses to `unknown`
 * rather than being trusted as an `ApiErrorCode`.
 */
function normaliseCode(code: string | number | undefined): ApiErrorCode {
  if (typeof code !== "string") return API_ERROR_CODES.unknown;

  const known = Object.values(API_ERROR_CODES) as string[];
  return known.includes(code) ? (code as ApiErrorCode) : API_ERROR_CODES.unknown;
}

/** Convert anything thrown inside the api layer into an `ApiError`. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? null;
    const body = error.response?.data;

    if (isApiErrorBody(body)) {
      return new ApiError({
        message: body.error.message,
        code: normaliseCode(body.error.code),
        status,
        details: body.error.details,
        cause: error,
      });
    }

    // No response at all: offline, DNS failure, CORS, or our own timeout.
    if (!error.response) {
      return new ApiError({
        message:
          error.code === "ECONNABORTED"
            ? "The server took too long to respond. It may be waking up — please try again."
            : "Could not reach the server. Check your connection and try again.",
        code: API_ERROR_CODES.network,
        status: null,
        cause: error,
      });
    }

    return new ApiError({
      message: error.message || "The request failed.",
      code: API_ERROR_CODES.unknown,
      status,
      cause: error,
    });
  }

  return new ApiError({
    message: error instanceof Error ? error.message : "Something went wrong.",
    code: API_ERROR_CODES.unknown,
    cause: error,
  });
}
