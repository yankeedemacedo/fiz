import { cn } from "@/lib/cn";

export function Spinner({
  className,
  label = "Carregando…",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span role="status" aria-label={label} className={cn("inline-flex", className)}>
      <span
        aria-hidden
        className="size-5 animate-spin rounded-full border-2 border-border border-t-primary-500"
      />
    </span>
  );
}
