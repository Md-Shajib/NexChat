import { getAvatarIndex, getInitials } from "@/domains/user/user.utils";
import { cn } from "@/shared/utils/cn";

/**
 * Deterministic palette — the same person always gets the same colour, which
 * makes group conversations scannable without loading any avatar images.
 */
const PALETTE = [
  "bg-[#2f6f5f] text-[#d7f2e6]",
  "bg-[#4a5a8a] text-[#dde4f7]",
  "bg-[#7a4a6a] text-[#f7dcec]",
  "bg-[#8a6a3a] text-[#f7e8cf]",
  "bg-[#3a6a8a] text-[#d6ecf7]",
  "bg-[#6a4a8a] text-[#e6dcf7]",
] as const;

type AvatarProps = {
  /** Stable identity used to pick the colour — a user or conversation id. */
  id: string;
  name: string;
  size?: "sm" | "md" | "lg";
  /** Groups get a subtly different treatment from people. */
  isGroup?: boolean;
  className?: string;
};

const SIZE_CLASSES = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
} as const;

export function Avatar({
  id,
  name,
  size = "md",
  isGroup = false,
  className,
}: AvatarProps) {
  const colour = PALETTE[getAvatarIndex(id, PALETTE.length)]!;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center font-semibold",
        isGroup ? "rounded-xl" : "rounded-full",
        SIZE_CLASSES[size],
        colour,
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
