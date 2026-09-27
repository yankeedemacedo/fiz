import type { Category, LegacyTask, Task } from "@/types";

/** New localStorage key for the Zustand store (versioned). */
export const STORE_KEY = "fiz-store-v1";
/** Legacy key written by the old App (`LegacyTask[]`). Read-only seed. */
export const LEGACY_TASKS_KEY = "tasks";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/**
 * Pure migration: legacy array → full `Task[]`.
 * Lenient by design — every salvageable entry survives, garbage is dropped.
 */
export function migrateLegacyTasks(raw: unknown): Task[] {
  if (!Array.isArray(raw)) return [];
  const now = new Date().toISOString();
  const out: Task[] = [];
  raw.forEach((item, index) => {
    if (!isRecord(item)) return;
    const id = typeof item["id"] === "string" ? item["id"] : null;
    const title = item["title"];
    if (id === null || typeof title !== "string") return;
    const legacy = item as Partial<LegacyTask>;
    out.push({
      id,
      title: legacy.title ?? "",
      description:
        typeof legacy.description === "string" ? legacy.description : "",
      isCompleted: legacy.isCompleted === true,
      order: index,
      createdAt: now,
      updatedAt: now,
    });
  });
  return out;
}

function readKey(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

/** True once the new store has persisted at least once. */
export function hasPersistedStore(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORE_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Seed for first run: migrated legacy tasks, or [] when the store
 * already persisted (persist middleware overwrites via merge).
 * Safe without `window`/`localStorage` — storage access is try/catch.
 */
export function loadSeedTasks(): Task[] {
  if (hasPersistedStore()) return [];
  return migrateLegacyTasks(readKey(LEGACY_TASKS_KEY));
}

export function defaultCategories(): Category[] {
  return [
    { id: "cat-personal", name: "Pessoal", color: "#0891b2", icon: "user" },
    { id: "cat-work", name: "Trabalho", color: "#7c3aed", icon: "briefcase" },
    { id: "cat-studies", name: "Estudos", color: "#059669", icon: "book-open" },
  ];
}

/** Seed defaults only on first run; never resurrect deleted categories. */
export function loadSeedCategories(): Category[] {
  if (hasPersistedStore()) return [];
  return defaultCategories();
}
