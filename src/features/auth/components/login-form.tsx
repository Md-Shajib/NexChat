"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { getUserFacingMessage } from "@/shared/lib/error-handler";
import { toApiError } from "@/shared/lib/api-error";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import { useLogin } from "../hooks/use-login";
import {
  loginSchema,
  type LoginFormOutput,
  type LoginFormValues,
} from "../schemas/login.schema";

/**
 * Login / implicit registration.
 *
 * There is no separate signup: an unknown phone number creates an account.
 * The copy says so explicitly, because a "Log in" button that silently
 * registers you is surprising otherwise.
 */
export function LoginForm() {
  const { mutate, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues, unknown, LoginFormOutput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "", name: "" },
    mode: "onBlur",
  });

  const submissionError = error ? toApiError(error) : null;

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => mutate(values))}
      className="flex w-full flex-col gap-4"
    >
      <Input
        label="Phone number"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        placeholder="+8801700000000"
        hint="New number? We'll create your account automatically."
        error={errors.phone?.message}
        {...register("phone")}
      />

      <Input
        label="Your name"
        type="text"
        autoComplete="name"
        placeholder="Ada Lovelace"
        error={errors.name?.message}
        {...register("name")}
      />

      {submissionError ? (
        <p role="alert" className="text-sm text-danger">
          {getUserFacingMessage(submissionError)}
        </p>
      ) : null}

      <Button type="submit" isLoading={isPending} className="mt-2 w-full">
        {isPending ? "Signing in…" : "Continue"}
      </Button>
    </form>
  );
}
