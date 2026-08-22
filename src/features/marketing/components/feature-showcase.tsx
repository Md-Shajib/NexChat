import type { ReactNode } from "react";

import { cn } from "@/shared/utils/cn";

import {
  IllustrationBroadcast,
  IllustrationGroups,
  IllustrationScrollAnchor,
} from "./illustrations";

type Feature = {
  eyebrow: string;
  title: string;
  body: string;
  detail: string;
  illustration: ReactNode;
};

const FEATURES: Feature[] = [
  {
    eyebrow: "Real-time",
    title: "Messages land the moment they're sent",
    body: "A single socket connection serves every conversation you have open. Incoming messages are pushed straight into the cache, so the thread and the sidebar update together — no polling, no refresh, no stale unread count.",
    detail: "Sends go over REST for a definitive success or failure, and the socket echo reconciles onto the same row instead of duplicating it.",
    illustration: <IllustrationBroadcast />,
  },
  {
    eyebrow: "Scroll anchoring",
    title: "It follows the conversation, not your scrollbar",
    body: "If you're at the bottom, new messages bring you with them. The instant you scroll up to read something, that stops — your position is held, and anything that arrives queues behind a pill you can tap when you're ready.",
    detail: "Loading older messages preserves the viewport too, so the text you're reading doesn't jump as history is prepended above it.",
    illustration: <IllustrationScrollAnchor />,
  },
  {
    eyebrow: "Groups",
    title: "One thread, everyone in it",
    body: "Start a direct conversation by searching a name or a number, or pull several people into a group. Admins can rename, add and remove; any member can leave.",
    detail: "Group membership changes are pushed to everyone in the group, so the member list and title stay correct without a reload.",
    illustration: <IllustrationGroups />,
  },
];

/**
 * Feature sections, alternating sides.
 *
 * Each block pairs a claim with a drawing of the mechanism behind it rather
 * than a generic card grid — the illustration is doing explanatory work.
 */
export function FeatureShowcase() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
      <div className="max-w-2xl">
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Three things worth getting right
        </h2>
        <p className="mt-3 text-pretty text-muted">
          Chat is easy to build badly. These are the parts that decide whether
          it feels finished.
        </p>
      </div>

      <div className="mt-14 space-y-16 lg:space-y-24">
        {FEATURES.map((feature, index) => (
          <article
            key={feature.title}
            className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
          >
            <div
              className={cn(
                "rounded-2xl border border-border bg-surface-raised p-8 text-accent",
                // Alternate which side the drawing sits on, without reordering
                // the DOM — the text stays first for screen readers.
                index % 2 === 1 && "lg:order-last",
              )}
            >
              {feature.illustration}
            </div>

            <div className="max-w-lg">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                {feature.eyebrow}
              </p>
              <h3 className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                {feature.title}
              </h3>
              <p className="mt-4 text-pretty leading-relaxed text-muted">
                {feature.body}
              </p>
              <p className="mt-4 border-l-2 border-border pl-4 text-sm text-pretty leading-relaxed text-muted">
                {feature.detail}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
