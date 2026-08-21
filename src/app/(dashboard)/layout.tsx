import type { ReactNode } from "react";

import { AuthGuard } from "@/features/auth";

/**
 * Everything under this segment requires a session.
 *
 * The guard is client-side because the JWT lives in localStorage, which
 * middleware cannot read — see `AuthGuard` for why that is deliberate.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
