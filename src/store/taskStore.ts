import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type {
  ActivityKind,
  Category,
  SavedView,
  SortMode,
  Subtask,
  Task,
  TaskActivity,
  TaskFilter,
  TaskPriority,
} from "@/types";
import {
  STORE_KEY,
  loadSeedCategories,
  loadSeedTasks,
} from "./migrate";

export type { SortMode } from "@/types";

export interface NewTaskInput {
  title: string;
  description: string;
  categoryId?: string;
  tags?: string[];
  priority?: TaskPriority;
  dueDate?: string | null;
}

export const initialFilter: TaskFilter = {
  query: "",
  status: "all",
  priority: "all",
  categoryId: "all",
  tags: [],
  due: "all",
};

interface TaskStore {
  tasks: Task[];
  categories: Category[];
  filter: TaskFilter;
  sort: SortMode;
  sidebarOpen: boolean;
  detailId: string | null;

  addTask: (input: NewTaskInput) => Task;
  toggleTask: (id: string) => void;
  updateTask: (id: string, patch: Partial<Omit<Task, "id">>) => void;
  deleteTask: (id: string) => void;
  duplicateTask: (id: string) => Task | undefined;
  moveTask: (activeId: string, overId: string) => void;
  moveTaskToGroup: (activeId: string, categoryId: string | undefined) => void;

  addCategory: (input: Pick<Category, "name" | "color" | "icon">) => Category;
  updateCategory: (id: string, patch: Partial<Omit<Category, "id">>) => void;
  deleteCategory: (id: string) => void;

  setFilter: (patch: Partial<TaskFilter>) => void;
  clearFilters: () => void;
  setSort: (sort: SortMode) => void;

  savedViews: SavedView[];
  addSavedView: (name: string) => SavedView;
  deleteSavedView: (id: string) => void;
  applySavedView: (id: string) => void;

  setSidebarOpen: (open: boolean) => void;
  managerOpen: boolean;
  setManagerOpen: (open: boolean) => void;
  openDetail: (id: string) => void;
  closeDetail: () => void;

  addSubtask: (taskId: string, title: string) => Subtask | undefined;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  renameSubtask: (taskId: string, subtaskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;

  lastDeleted: { task: Task; index: number } | null;
  undoDelete: () => void;

  toasts: Toast[];
  pushToast: (message: string, action?: ToastAction) => string;
  dismissToast: (id: string) => void;

  /** Load data from API (or localStorage fallback). */
  loadFromAPI: () => Promise<void>;
  /** Save data to API (debounced). */
  saveToAPI: () => void;
}

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  message: string;
  action?: ToastAction;
}

const API_BASE = "/api";
const SAVE_DEBOUNCE_MS = 500;

function stamp(): Pick<Task, "createdAt" | "updatedAt"> {
  const now = new Date().toISOString();
  return { createdAt: now, updatedAt: now };
}

const MAX_ACTIVITY = 30;

function log(kind: ActivityKind, detail?: string): TaskActivity {
  return { id: uuidv4(), at: new Date().toISOString(), kind, detail };
}

function pushActivity(task: Task, entries: TaskActivity[]): Task {
  if (entries.length === 0) return task;
  return { ...task, activity: [...(task.activity ?? []), ...entries].slice(-MAX_ACTIVITY) };
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function debouncedSave(get: () => { tasks: Task[]; categories: Category[] }) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const { tasks, categories } = get();
    fetch(`${API_BASE}/data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks, categories }),
    }).catch(() => {
      // Silently fail — localStorage has the data.
    });
  }, SAVE_DEBOUNCE_MS);
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: loadSeedTasks(),
      categories: loadSeedCategories(),
      filter: initialFilter,
      sort: "manual",
      savedViews: [],
      lastDeleted: null,
      toasts: [],
      sidebarOpen: false,
      managerOpen: false,
      detailId: null,

      loadFromAPI: async () => {
        try {
          const res = await fetch(`${API_BASE}/data`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.tasks) && Array.isArray(data.categories)) {
              set({ tasks: data.tasks, categories: data.categories });
              return;
            }
          }
        } catch {
          // Ignore — fall through to localStorage seed.
        }
        // API failed or empty: keep localStorage seed (already set via persist).
      },

      saveToAPI: () => debouncedSave(get),

      addTask: (input) => {
        const { tasks } = get();
        const order = tasks.reduce((m, t) => Math.max(m, t.order ?? 0), -1) + 1;
        const task: Task = {
          id: uuidv4(),
          title: input.title,
          description: input.description,
          isCompleted: false,
          order,
          categoryId: input.categoryId,
          tags: input.tags ?? [],
          priority: input.priority ?? "medium",
          dueDate: input.dueDate ?? null,
          activity: [log("created")],
          ...stamp(),
        };
        set({ tasks: [...tasks, task] });
        get().saveToAPI();
        return task;
      },

      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== id) return t;
            const completed = !t.isCompleted;
            return pushActivity(
              {
                ...t,
                isCompleted: completed,
                updatedAt: new Date().toISOString(),
              },
              [log(completed ? "completed" : "reopened")],
            );
          }),
        })),

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== id) return t;
            const entries: TaskActivity[] = [];
            if (patch.title !== undefined && patch.title !== t.title)
              entries.push(log("renamed", patch.title));
            if (
              patch.categoryId !== undefined ||
              "categoryId" in patch
            ) {
              const next = patch.categoryId ?? undefined;
              if (next !== (t.categoryId ?? undefined))
                entries.push(log("moved", next));
            }
            if (patch.priority !== undefined && patch.priority !== t.priority)
              entries.push(log("priorityChanged", patch.priority));
            if (
              patch.dueDate !== undefined &&
              (patch.dueDate ?? null) !== (t.dueDate ?? null)
            )
              entries.push(log("dueChanged", patch.dueDate ?? undefined));
            if (entries.length === 0) entries.push(log("edited"));
            return pushActivity(
              { ...t, ...patch, updatedAt: new Date().toISOString() },
              entries,
            );
          }),
        })),

      deleteTask: (id) =>
        set((s) => {
          const index = s.tasks.findIndex((t) => t.id === id);
          if (index === -1) return s;
          const newTasks = s.tasks.filter((t) => t.id !== id);
          get().saveToAPI();
          return {
            tasks: newTasks,
            detailId: s.detailId === id ? null : s.detailId,
            lastDeleted: { task: s.tasks[index] as Task, index },
          };
        }),

      undoDelete: () =>
        set((s) => {
          if (!s.lastDeleted) return s;
          const { task, index } = s.lastDeleted;
          if (s.tasks.some((t) => t.id === task.id)) return { lastDeleted: null };
          const next = [...s.tasks];
          next.splice(Math.min(index, next.length), 0, task);
          get().saveToAPI();
          return {
            tasks: next.map((t, i) => ({ ...t, order: i })),
            lastDeleted: null,
          };
        }),

      pushToast: (message, action) => {
        const id = uuidv4();
        set((s) => ({ toasts: [...s.toasts.slice(-2), { id, message, action }] }));
        return id;
      },

      dismissToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      duplicateTask: (id) => {
        const { tasks } = get();
        const src = tasks.find((t) => t.id === id);
        if (!src) return undefined;
        const order = tasks.reduce((m, t) => Math.max(m, t.order ?? 0), -1) + 1;
        const copy: Task = {
          ...src,
          id: uuidv4(),
          title: `${src.title} (cópia)`,
          isCompleted: false,
          order,
          subtasks: src.subtasks?.map((st) => ({
            ...st,
            id: uuidv4(),
            completed: false,
          })),
          activity: [log("created")],
          ...stamp(),
        };
        set({ tasks: [...tasks, copy] });
        get().saveToAPI();
        return copy;
      },

      moveTask: (activeId, overId) => {
        if (activeId === overId) return;
        const { tasks } = get();
        const from = tasks.findIndex((t) => t.id === activeId);
        const to = tasks.findIndex((t) => t.id === overId);
        if (from === -1 || to === -1) return;
        const next = [...tasks];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        set({ tasks: next.map((t, i) => ({ ...t, order: i })) });
        get().saveToAPI();
      },

      moveTaskToGroup: (activeId, categoryId) => {
        const { tasks } = get();
        const from = tasks.findIndex((t) => t.id === activeId);
        if (from === -1) return;
        const next = [...tasks];
        const [moved] = next.splice(from, 1);
        let insertAt = 0;
        for (let i = next.length - 1; i >= 0; i--) {
          if ((next[i]?.categoryId ?? undefined) === categoryId) {
            insertAt = i + 1;
            break;
          }
        }
        next.splice(insertAt, 0, { ...moved, categoryId });
        set({
          tasks: next.map((t, i) =>
            t.id === activeId
              ? pushActivity({ ...t, order: i }, [log("moved", categoryId)])
              : { ...t, order: i },
          ),
        });
        get().saveToAPI();
      },

      addCategory: (input) => {
        const category: Category = { id: uuidv4(), ...input };
        set((s) => ({ categories: [...s.categories, category] }));
        get().saveToAPI();
        return category;
      },

      updateCategory: (id, patch) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        })),

      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          tasks: s.tasks.map((t) =>
            t.categoryId === id ? { ...t, categoryId: undefined } : t,
          ),
          filter:
            s.filter.categoryId === id
              ? { ...s.filter, categoryId: "all" }
              : s.filter,
        })),

      setFilter: (patch) =>
        set((s) => ({ filter: { ...s.filter, ...patch } })),

      clearFilters: () => set({ filter: initialFilter }),

      setSort: (sort) => set({ sort }),

      addSavedView: (name) => {
        const view: SavedView = {
          id: uuidv4(),
          name: name.trim(),
          filter: { ...get().filter, tags: [...get().filter.tags] },
          sort: get().sort,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ savedViews: [...s.savedViews, view] }));
        get().saveToAPI();
        return view;
      },

      deleteSavedView: (id) =>
        set((s) => ({ savedViews: s.savedViews.filter((v) => v.id !== id) })),

      applySavedView: (id) => {
        const view = get().savedViews.find((v) => v.id === id);
        if (!view) return;
        set({
          filter: { ...view.filter, tags: [...view.filter.tags] },
          sort: view.sort,
        });
      },

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setManagerOpen: (open) => set({ managerOpen: open }),
      openDetail: (id) => set({ detailId: id }),
      closeDetail: () => set({ detailId: null }),

      addSubtask: (taskId, title) => {
        const trimmed = title.trim().slice(0, 120);
        if (!trimmed) return undefined;
        const sub: Subtask = { id: uuidv4(), title: trimmed, completed: false };
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: [...(t.subtasks ?? []), sub],
                  updatedAt: new Date().toISOString(),
                }
              : t,
          ),
        }));
        get().saveToAPI();
        return sub;
      },

      toggleSubtask: (taskId, subtaskId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: (t.subtasks ?? []).map((st) =>
                    st.id === subtaskId
                      ? { ...st, completed: !st.completed }
                      : st,
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : t,
          ),
        })),

      renameSubtask: (taskId, subtaskId, title) => {
        const trimmed = title.trim().slice(0, 120);
        if (!trimmed) return;
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: (t.subtasks ?? []).map((st) =>
                    st.id === subtaskId ? { ...st, title: trimmed } : st,
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : t,
          ),
        }));
        get().saveToAPI();
      },

      deleteSubtask: (taskId, subtaskId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: (t.subtasks ?? []).filter(
                    (st) => st.id !== subtaskId,
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : t,
          ),
        })),

      // Initialize: try API, then seed from localStorage if needed.
    }),
    {
      name: STORE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        tasks: s.tasks,
        categories: s.categories,
        filter: s.filter,
        sort: s.sort,
        savedViews: s.savedViews,
        // UI-only (toasts, lastDeleted, sidebar, manager, detailId) fora do persist.
      }),
    },
  ),
);

// On load: fetch from API.
if (typeof window !== "undefined") {
  useTaskStore.getState().loadFromAPI();
}

// Cross-tab sync for UI state (filter/sort/views).
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORE_KEY) void useTaskStore.persist.rehydrate();
  });
}
