import Link from "next/link";

import { appConfig } from "@/config/app-config";
import { ROUTES } from "@/constants/routes";
import { IconMessage } from "@/shared/icons";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-10 border-b border-border/60 bg-background/70 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href={ROUTES.landing} className="flex items-center gap-2 font-semibold">
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <IconMessage className="size-4.5" />
          </span>
          {appConfig.name}
        </Link>

        <div className="flex items-center gap-1.5">
          <a
            href="#how-it-works"
            className="hidden rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-foreground sm:inline-flex"
          >
            How it works
          </a>
          <Link
            href={ROUTES.login}
            className="inline-flex h-9 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Open the app
          </Link>
        </div>
      </nav>
    </header>
  );
}
