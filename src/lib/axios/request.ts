import type { AxiosRequestConfig } from "axios";
import type { ZodType } from "zod";
import { z } from "zod";

import { ApiError, toApiError } from "@/shared/lib/api-error";
import { API_ERROR_CODES } from "@/types/api";

import { apiClient } from "./api-client";

type RequestOptions<TOut> = AxiosRequestConfig & {
  /**
   * Schema the response body is parsed with.
   *
   * The upstream API documents no response shapes at all, so we validate every
   * payload at the boundary. A drift in the API becomes a loud, located error
   * instead of an `undefined` three components deep.
   */
  schema: ZodType<TOut>;
};

/**
 * Perform a request and return a parsed, fully-typed body.
 *
 * Throws `ApiError` — and only `ApiError` — on any failure.
 */
export async function request<TOut>(
  options: RequestOptions<TOut>,
): Promise<TOut> {
  const { schema, ...config } = options;

  let data: unknown;
  try {
    const response = await apiClient.request<unknown>(config);
    data = response.data;
  } catch (error) {
    // The response interceptor already normalised this, but a request-phase
    // failure (bad config, serialisation) can still arrive raw.
    throw toApiError(error);
  }

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new ApiError({
      message: "The server returned data in an unexpected format.",
      code: API_ERROR_CODES.malformedResponse,
      details: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
      cause: parsed.error,
    });
  }

  return parsed.data;
}

/** Convenience wrappers — thin, but they keep the api files declarative. */
export const http = {
  get: <TOut>(url: string, options: RequestOptions<TOut>) =>
    request<TOut>({ ...options, url, method: "GET" }),

  post: <TOut>(url: string, body: unknown, options: RequestOptions<TOut>) =>
    request<TOut>({ ...options, url, method: "POST", data: body }),

  patch: <TOut>(url: string, body: unknown, options: RequestOptions<TOut>) =>
    request<TOut>({ ...options, url, method: "PATCH", data: body }),

  delete: <TOut>(url: string, options: RequestOptions<TOut>) =>
    request<TOut>({ ...options, url, method: "DELETE" }),
};

/**
 * Several endpoints answer a mutation with `204` or an empty body. Use this as
 * the schema there rather than inventing a shape.
 */
export const emptyResponseSchema = z.unknown().transform(() => null);
