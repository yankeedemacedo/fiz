/**
 * Shared domain types. New optional fields are additive so legacy
 * `localStorage["tasks"]` entries ({id,title,description,isCompleted})
 * keep loading — see store migration in Passo 2.
 */

export type TaskPriority = "low" | "medium" | "high";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export type ActivityKind =
  | "created"
  | "completed"
  | "reopened"
  | "renamed"
  | "moved"
  | "edited"
  | "dueChanged"
  | "priorityChanged";

export interface TaskActivity {
  id: string;
  at: string;
  kind: ActivityKind;
  /** Extra context: new title / categoryId / priority / dueDate. */
  detail?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  /** Passo 4+: fractional index for manual drag-and-drop order. */
  order?: number;
  categoryId?: string;
  tags?: string[];
  priority?: TaskPriority;
  dueDate?: string | null;
  subtasks?: Subtask[];
  activity?: TaskActivity[];
  createdAt: string;
  updatedAt: string;
}

/** Legacy shape stored by the current App (no timestamps). */
export type LegacyTask = Pick<
  Task,
  "id" | "title" | "description" | "isCompleted"
>;

export interface Category {
  id: string;
  name: string;
  /** Hex color, e.g. "#06b6d4". */
  color: string;
  /** lucide-react icon name key used by the UI. */
  icon?: string;
}

export type TaskStatusFilter = "all" | "pending" | "completed";

export type DueFilter = "all" | "overdue" | "today" | "week" | "none";

export type SortMode = "manual" | "created" | "priority" | "dueDate" | "alpha";

export interface TaskFilter {
  query: string;
  status: TaskStatusFilter;
  priority: TaskPriority | "all";
  categoryId: string | "all";
  tags: string[];
  due: DueFilter;
}

export interface SavedView {
  id: string;
  name: string;
  filter: TaskFilter;
  sort: SortMode;
  createdAt: string;
}
