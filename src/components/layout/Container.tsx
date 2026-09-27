import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type MaxWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

const widths: Record<MaxWidth, string> = {
  sm: "max-w-sm",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  "2xl": "max-w-7xl",
  full: "max-w-full",
};

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  maxWidth?: MaxWidth;
}

export function Container({
  maxWidth = "2xl",
  className,
  ...rest
}: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", widths[maxWidth], className)}
      {...rest}
    />
  );
}

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  gap?: 1 | 2 | 3 | 4 | 6 | 8;
  direction?: "vertical" | "horizontal";
}

const gaps = {
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
} as const;

export function Stack({
  gap = 4,
  direction = "vertical",
  className,
  ...rest
}: StackProps) {
  return (
    <div
      className={cn(
        "flex",
        direction === "vertical" ? "flex-col" : "flex-row",
        gaps[gap],
        className,
      )}
      {...rest}
    />
  );
}
