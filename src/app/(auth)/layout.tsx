import type { ReactNode } from "react";

/** Centred, single-column shell for the unauthenticated routes. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
