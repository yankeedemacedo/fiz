import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ invalid = false, className, ...rest }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "h-10 w-full rounded-md border bg-surface px-3 text-sm text-text",
        "placeholder:text-text-muted",
        "transition-colors duration-fast ease-out-expo",
        "hover:border-text-muted",
        invalid
          ? "border-red-500"
          : "border-border focus:border-primary-500",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...rest}
    />
  ),
);
Input.displayName = "Input";
