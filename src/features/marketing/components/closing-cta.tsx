import Link from "next/link";

import { ROUTES } from "@/constants/routes";

export function ClosingCta() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 lg:pb-28">
      <div className="relative overflow-hidden rounded-3xl border border-border px-8 py-14 text-center sm:px-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(80% 120% at 50% 0%, color-mix(in oklab, var(--accent) 26%, transparent), transparent 70%)",
          }}
        />

        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Two fields and you&apos;re in
        </h2>
        <p className="mx-auto mt-3 max-w-md text-pretty text-muted">
          A phone number and a name. If the number is new, the account is
          created for you — there&apos;s nothing else to fill in.
        </p>

        <Link
          href={ROUTES.login}
          className="mt-8 inline-flex h-11 items-center rounded-xl bg-accent px-7 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Start a conversation
        </Link>
      </div>
    </section>
  );
}
