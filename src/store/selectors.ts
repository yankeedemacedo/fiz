import type { DueFilter, SortMode, Task, TaskFilter } from "@/types";
import { diffDays, todayKey } from "@/lib/dates";

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

const PRIORITY_WEIGHT = { high: 0, medium: 1, low: 2 } as const;

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function isOverdue(task: Task): boolean {
  if (task.isCompleted || !task.dueDate) return false;
  return task.dueDate.slice(0, 10) < todayKey();
}

export function matchesQuery(task: Task, query: string): boolean {
  const q = normalize(query.trim());
  if (!q) return true;
  const hay = normalize(
    [task.title, task.description, ...(task.tags ?? [])].join(" "),
  );
  return q.split(/\s+/).every((word) => hay.includes(word));
}

export function applyFilter(
  tasks: Task[],
  filter: TaskFilter,
  today: string = todayKey(),
): Task[] {
  return tasks.filter((t) => {
    if (filter.status === "completed" && !t.isCompleted) return false;
    if (filter.status === "pending" && t.isCompleted) return false;
    if (filter.priority !== "all" && (t.priority ?? "low") !== filter.priority)
      return false;
    if (filter.categoryId !== "all" && t.categoryId !== filter.categoryId)
      return false;
    if (
      filter.tags.length > 0 &&
      !filter.tags.every((tag) =>
        (t.tags ?? []).some((tt) => tt.toLowerCase() === tag.toLowerCase()),
      )
    )
      return false;
    if (!matchesDue(t, filter.due, today)) return false;
    return matchesQuery(t, filter.query);
  });
}

export function matchesDue(
  task: Task,
  due: DueFilter,
  today: string = todayKey(),
): boolean {
  switch (due) {
    case "all":
      return true;
    case "none":
      return !task.dueDate;
    case "overdue":
      return !!task.dueDate && task.dueDate.slice(0, 10) < today;
    case "today":
      return !!task.dueDate && task.dueDate.slice(0, 10) === today;
    case "week": {
      if (!task.dueDate) return false;
      const d = diffDays(task.dueDate);
      return d >= 0 && d <= 7;
    }
  }
}

export function isFilterDefault(filter: TaskFilter): boolean {
  return (
    filter.query === "" &&
    filter.status === "all" &&
    filter.priority === "all" &&
    filter.categoryId === "all" &&
    filter.tags.length === 0 &&
    filter.due === "all"
  );
}

export interface TagCount {
  tag: string;
  count: number;
}

/** All tags in use, most frequent first (powers autocomplete + filter chips). */
export function selectAllTags(tasks: Task[]): TagCount[] {
  const counts = new Map<string, { tag: string; count: number }>();
  for (const t of tasks) {
    for (const raw of t.tags ?? []) {
      const key = raw.toLowerCase();
      const entry = counts.get(key);
      if (entry) entry.count += 1;
      else counts.set(key, { tag: raw, count: 1 });
    }
  }
  return [...counts.values()].sort(
    (a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "pt-BR"),
  );
}

export function applySort(tasks: Task[], sort: SortMode): Task[] {
  const arr = [...tasks];
  switch (sort) {
    case "created":
      return arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "priority":
      return arr.sort(
        (a, b) =>
          (PRIORITY_WEIGHT[a.priority ?? "low"] ?? 3) -
            (PRIORITY_WEIGHT[b.priority ?? "low"] ?? 3) ||
          (a.order ?? 0) - (b.order ?? 0),
      );
    case "dueDate":
      return arr.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return (a.order ?? 0) - (b.order ?? 0);
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
    case "alpha":
      return arr.sort((a, b) =>
        a.title.localeCompare(b.title, "pt-BR", { sensitivity: "base" }),
      );
    case "manual":
    default:
      return arr.sort(
        (a, b) =>
          (a.order ?? 0) - (b.order ?? 0) ||
          a.createdAt.localeCompare(b.createdAt),
      );
  }
}

export function selectFilteredTasks(state: {
  tasks: Task[];
  filter: TaskFilter;
  sort: SortMode;
}): Task[] {
  return applySort(applyFilter(state.tasks, state.filter), state.sort);
}

export function selectTaskStats(tasks: Task[]): TaskStats {
  let completed = 0;
  let overdue = 0;
  for (const t of tasks) {
    if (t.isCompleted) completed += 1;
    else if (isOverdue(t)) overdue += 1;
  }
  return { total: tasks.length, completed, pending: tasks.length - completed, overdue };
}
