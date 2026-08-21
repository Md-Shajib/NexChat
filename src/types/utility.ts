/** Branded id types — prevents passing a userId where a conversationId is due. */
declare const brand: unique symbol;
export type Brand<T, B extends string> = T & { readonly [brand]: B };

export type Nullable<T> = T | null;

export type AsyncStatus = "idle" | "loading" | "success" | "error";

/** Make selected keys of `T` optional. */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Make selected keys of `T` required. */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;
