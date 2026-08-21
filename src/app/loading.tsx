import { Spinner } from "@/shared/ui/spinner";

export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Spinner className="size-6 text-muted" />
    </div>
  );
}
