import type { Tone } from "./Badge";
import type { TaskPriority } from "@/types";

export const priorityTone: Record<TaskPriority, Tone> = {
  low: "neutral",
  medium: "warning",
  high: "danger",
};
