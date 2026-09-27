import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md";
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = "md", label, className, ...rest }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-md text-text-muted",
        "transition-colors duration-fast ease-out-expo",
        "hover:bg-surface-2 hover:text-text active:bg-border",
        "disabled:pointer-events-none disabled:opacity-50",
        size === "sm" ? "size-8" : "size-10",
        className,
      )}
      {...rest}
    />
  ),
);
IconButton.displayName = "IconButton";
