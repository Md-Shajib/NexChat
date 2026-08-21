import { cn } from "@/shared/utils/cn";

/** Loading placeholder. Prefer this over a spinner for list-shaped content. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-surface-hover", className)}
    />
  );
}
