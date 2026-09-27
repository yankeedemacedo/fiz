import { useTaskStore } from "./taskStore";
import { useShallow } from "zustand/react/shallow";
import {
  selectFilteredTasks,
  selectTaskStats,
  type TaskStats,
} from "./selectors";
import type { Task } from "@/types";

/** Memoized filtered+sorted list (shallow-compared, no extra renders). */
export function useFilteredTasks(): Task[] {
  return useTaskStore(useShallow(selectFilteredTasks));
}

export function useTaskStats(): TaskStats {
  return useTaskStore(useShallow((s) => selectTaskStats(s.tasks)));
}
