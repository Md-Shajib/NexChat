import type { Metadata } from "next";

import { appConfig } from "@/config/app-config";
import {
  ClosingCta,
  FeatureShowcase,
  Hero,
  MarketingNav,
  SiteFooter,
} from "@/features/marketing";

export const metadata: Metadata = {
  title: `${appConfig.name} — messaging that respects where you're reading`,
  description:
    "A real-time chat client with scroll anchoring, group conversations, and no signup step. Try the live demo in the page.",
};

/**
 * Landing page (assignment Part 2).
 *
 * Composition only — every section is a marketing feature component. Server
 * rendered apart from the interactive hero demo, which is the sole client
 * boundary on the page.
 */
export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <MarketingNav />
      <main className="flex-1">
        <Hero />
        <FeatureShowcase />
        <ClosingCta />
      </main>
      <SiteFooter />
    </div>
  );
}
