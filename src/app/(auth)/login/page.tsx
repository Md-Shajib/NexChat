import type { Metadata } from "next";

import { appConfig } from "@/config/app-config";
import { LoginForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Sign in",
};

/** Route composition only — all logic lives in the auth feature. */
export default function LoginPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold">Welcome to {appConfig.name}</h1>
        <p className="text-sm text-muted">
          Enter your phone number and name to continue.
        </p>
      </header>

      <LoginForm />
    </div>
  );
}
