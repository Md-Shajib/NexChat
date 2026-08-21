import Link from "next/link";

import { appConfig } from "@/config/app-config";
import { ROUTES } from "@/constants/routes";

/**
 * Landing page (assignment Part 2).
 *
 * Placeholder for now — the creative page is built on top of this route so the
 * marketing surface and the product share one deployment and one design token
 * set (`styles/globals.css`).
 */
export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">
          {appConfig.name}
        </p>
        <h1 className="text-balance text-4xl font-semibold sm:text-5xl">
          {appConfig.description}
        </h1>
        <p className="mx-auto max-w-md text-pretty text-muted">
          Sign in with a phone number and start talking. No signup step, no
          passwords.
        </p>
      </div>

      <Link
        href={ROUTES.login}
        className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
      >
        Open the app
      </Link>
    </main>
  );
}
