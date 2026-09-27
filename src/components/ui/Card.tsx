import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: 1 | 2 | 3;
  padding?: "none" | "sm" | "md" | "lg";
}

const shadows = {
  1: "shadow-elevation-1",
  2: "shadow-elevation-2",
  3: "shadow-elevation-3",
} as const;

const paddings = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ elevation = 1, padding = "md", className, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-border bg-surface text-text",
        "transition-colors duration-base ease-out-expo",
        shadows[elevation],
        paddings[padding],
        className,
      )}
      {...rest}
    />
  ),
);
Card.displayName = "Card";
