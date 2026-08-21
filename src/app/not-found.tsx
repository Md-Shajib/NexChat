import Link from "next/link";

import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="max-w-sm text-sm text-muted">
          That link doesn&apos;t lead anywhere.
        </p>
      </div>
      <Link
        href={ROUTES.chat}
        className="text-sm font-medium text-accent underline underline-offset-4"
      >
        Back to your chats
      </Link>
    </main>
  );
}
