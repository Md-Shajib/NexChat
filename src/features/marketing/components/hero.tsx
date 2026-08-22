import Link from "next/link";

import { ROUTES } from "@/constants/routes";

import { LiveChatDemo } from "./live-chat-demo";

/**
 * Hero.
 *
 * The mockup on the right is the actual product behaviour running in the page,
 * so the headline's claim is verifiable in the same viewport that makes it.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Layered gradient wash — cheap, GPU-friendly, no images. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(70% 55% at 15% 0%, color-mix(in oklab, var(--accent) 22%, transparent), transparent 70%), radial-gradient(50% 50% at 90% 15%, color-mix(in oklab, var(--accent) 14%, transparent), transparent 70%)",
        }}
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:gap-16 lg:py-28">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs font-medium text-muted backdrop-blur">
            <span className="size-1.5 rounded-full bg-success" />
            Real-time, one-to-one and group
          </p>

          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Messaging that respects{" "}
            <span className="bg-gradient-to-r from-accent to-[color-mix(in_oklab,var(--accent)_55%,white)] bg-clip-text text-transparent">
              where you&apos;re reading
            </span>
            .
          </h1>

          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted">
            A chat client built around the details most get wrong — messages
            that arrive without a refresh, a thread that never yanks you back
            down mid-sentence, and a composer that won&apos;t send an empty
            bubble.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={ROUTES.login}
              className="inline-flex h-11 items-center rounded-xl bg-accent px-6 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Start a conversation
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-11 items-center rounded-xl border border-border px-6 text-sm font-medium transition-colors hover:bg-surface-hover"
            >
              See how it behaves
            </a>
          </div>

          <p className="mt-4 text-xs text-muted">
            No password. Enter a phone number and a name — a new number signs
            you up automatically.
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <LiveChatDemo />
        </div>
      </div>
    </section>
  );
}
