import type { SVGProps } from "react";

/**
 * Custom illustrations for the marketing sections.
 *
 * Drawn for this product rather than pulled from a pack — each one depicts the
 * mechanism the section is describing, so the picture carries information
 * instead of decorating the paragraph. All strokes use `currentColor` so they
 * inherit the section's palette in both themes.
 */
type IllustrationProps = SVGProps<SVGSVGElement>;

/**
 * Real-time delivery: one message fanning out to every participant at once.
 */
export function IllustrationBroadcast(props: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 320 220"
      fill="none"
      aria-hidden="true"
      className="h-auto w-full"
      {...props}
    >
      <defs>
        <linearGradient id="bc-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.05" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.55" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Connection lines from the origin bubble to each recipient. */}
      <g stroke="url(#bc-line)" strokeWidth="1.5">
        <path d="M96 110 C 150 110, 170 46, 236 46" />
        <path d="M96 110 C 150 110, 170 110, 236 110" />
        <path d="M96 110 C 150 110, 170 174, 236 174" />
      </g>

      {/* Travelling pulses — the "without a refresh" part, made literal. */}
      <g fill="currentColor" className="motion-reduce:hidden">
        <circle r="3.5" opacity="0.9">
          <animateMotion dur="2.6s" repeatCount="indefinite"
            path="M96 110 C 150 110, 170 46, 236 46" />
        </circle>
        <circle r="3.5" opacity="0.9">
          <animateMotion dur="2.6s" begin="0.45s" repeatCount="indefinite"
            path="M96 110 C 150 110, 170 110, 236 110" />
        </circle>
        <circle r="3.5" opacity="0.9">
          <animateMotion dur="2.6s" begin="0.9s" repeatCount="indefinite"
            path="M96 110 C 150 110, 170 174, 236 174" />
        </circle>
      </g>

      {/* Origin: the message being sent. */}
      <g>
        <rect x="22" y="88" width="76" height="44" rx="14"
          fill="currentColor" fillOpacity="0.14"
          stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" />
        <path d="M40 104h40M40 116h26" stroke="currentColor" strokeOpacity="0.7"
          strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Recipients. */}
      <g stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5"
        fill="currentColor" fillOpacity="0.1">
        <circle cx="256" cy="46" r="20" />
        <circle cx="256" cy="110" r="20" />
        <circle cx="256" cy="174" r="20" />
      </g>
      <g fill="currentColor" fillOpacity="0.55">
        <circle cx="256" cy="41" r="6" />
        <circle cx="256" cy="105" r="6" />
        <circle cx="256" cy="169" r="6" />
        <path d="M244 60a12 12 0 0 1 24 0Z" />
        <path d="M244 124a12 12 0 0 1 24 0Z" />
        <path d="M244 188a12 12 0 0 1 24 0Z" />
      </g>
    </svg>
  );
}

/**
 * Scroll anchoring: the reader holds position up the thread while new messages
 * stack up below, waiting rather than shoving.
 */
export function IllustrationScrollAnchor(props: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 320 220"
      fill="none"
      aria-hidden="true"
      className="h-auto w-full"
      {...props}
    >
      <rect x="66" y="14" width="188" height="192" rx="18"
        stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />

      {/* Messages the reader is looking at — crisp. */}
      <g fill="currentColor">
        <rect x="84" y="34" width="104" height="22" rx="11" fillOpacity="0.16" />
        <rect x="132" y="64" width="104" height="22" rx="11" fillOpacity="0.28" />
        <rect x="84" y="94" width="88" height="22" rx="11" fillOpacity="0.16" />
      </g>

      {/* The reader's viewport, held in place. */}
      <rect x="74" y="26" width="172" height="98" rx="12"
        stroke="currentColor" strokeWidth="2" strokeDasharray="5 4"
        strokeOpacity="0.8" />

      {/* Newer messages queueing below, deliberately faded. */}
      <g fill="currentColor">
        <rect x="132" y="138" width="104" height="22" rx="11" fillOpacity="0.12" />
        <rect x="132" y="168" width="76" height="22" rx="11" fillOpacity="0.07" />
      </g>

      {/* The "new messages" pill. */}
      <g>
        <rect x="122" y="118" width="76" height="24" rx="12" fill="currentColor" />
        <path d="M143 126v8m0 0 3.5-3.5M143 134l-3.5-3.5"
          stroke="var(--background)" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" />
        <rect x="152" y="128" width="30" height="4" rx="2"
          fill="var(--background)" opacity="0.9" />
      </g>
    </svg>
  );
}

/**
 * Groups: overlapping circles of people, one thread shared between them.
 */
export function IllustrationGroups(props: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 320 220"
      fill="none"
      aria-hidden="true"
      className="h-auto w-full"
      {...props}
    >
      <g stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5">
        <circle cx="126" cy="110" r="62" />
        <circle cx="194" cy="110" r="62" />
      </g>
      <circle cx="160" cy="110" r="28" fill="currentColor" fillOpacity="0.12" />

      {/* Members around the ring. */}
      <g fill="currentColor" fillOpacity="0.75">
        <circle cx="126" cy="48" r="13" />
        <circle cx="64" cy="110" r="13" />
        <circle cx="126" cy="172" r="13" />
        <circle cx="194" cy="48" r="13" />
        <circle cx="256" cy="110" r="13" />
        <circle cx="194" cy="172" r="13" />
      </g>

      {/* The shared thread at the intersection. */}
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
        strokeOpacity="0.85">
        <path d="M146 104h28" />
        <path d="M146 116h18" />
      </g>
    </svg>
  );
}
