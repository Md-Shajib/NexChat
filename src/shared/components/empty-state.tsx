import type { ReactNode } from "react";

import { cn } from "@/shared/utils/cn";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

/** The shared "there is nothing here yet" panel — one of the three states. */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? <div className="text-muted">{icon}</div> : null}
      <div className="space-y-1">
        <p className="font-medium text-foreground">{title}</p>
        {description ? (
          <p className="max-w-sm text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
