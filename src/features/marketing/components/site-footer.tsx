import Link from "next/link";

import { appConfig } from "@/config/app-config";
import { ROUTES } from "@/constants/routes";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          {appConfig.name} — {appConfig.description}
        </p>

        <nav className="flex items-center gap-5">
          <Link
            href={ROUTES.login}
            className="transition-colors hover:text-foreground"
          >
            Open the app
          </Link>
          <a
            href="https://frontend-task-chatapp.onrender.com/docs/"
            target="_blank"
            rel="noreferrer noopener"
            className="transition-colors hover:text-foreground"
          >
            API reference
          </a>
        </nav>
      </div>
    </footer>
  );
}
