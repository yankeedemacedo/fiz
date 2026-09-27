import { describe, expect, it } from "vitest";
import { initialFilter } from "@/store/taskStore";
import {
  applyFilter,
  applySort,
  isFilterDefault,
  matchesDue,
  matchesQuery,
  selectAllTags,
  selectFilteredTasks,
  selectTaskStats,
} from "@/store/selectors";
import type { Task } from "@/types";

const TODAY = "2026-09-27";

function mk(over: Partial<Task> & { id: string }): Task {
  return {
    title: over.id,
    description: "",
    isCompleted: false,
    order: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...over,
  };
}

const LIST = [
  mk({ id: "1", title: "Zebra", order: 2, priority: "low", categoryId: "c1" }),
  mk({ id: "2", title: "maçã", order: 0, priority: "high", isCompleted: true }),
  mk({
    id: "3",
    title: "Bola",
    order: 1,
    priority: "medium",
    dueDate: "2000-05-05",
    categoryId: "c1",
  }),
  mk({ id: "4", title: "Dado", order: 3, dueDate: "2099-01-01" }),
];

describe("matchesQuery", () => {
  it("is accent-insensitive and multi-word", () => {
    expect(matchesQuery(mk({ id: "x", title: "Café passado" }), "cafe")).toBe(true);
    expect(
      matchesQuery(
        mk({ id: "x", title: "Mercado", description: "lista", tags: ["casa"] }),
        "mercado casa",
      ),
    ).toBe(true);
    expect(matchesQuery(mk({ id: "x", title: "Mercado" }), "escola")).toBe(false);
    expect(matchesQuery(mk({ id: "x", title: "A" }), "")).toBe(true);
  });
});

describe("matchesDue", () => {
  it.each([
    ["all", "2026-09-27", true],
    ["none", "2026-09-27", false],
    ["overdue", "2000-01-01", true],
    ["overdue", TODAY, false],
    ["today", TODAY, true],
    ["today", "2026-09-28", false],
    ["week", "2026-10-04", true],
    ["week", "2026-10-05", false],
    ["week", "2026-09-26", false],
  ] as const)("due=%s date=%s → %s", (due, date, expected) => {
    expect(matchesDue(mk({ id: "x", dueDate: date }), due, TODAY)).toBe(expected);
  });

  it("handles missing dates", () => {
    expect(matchesDue(mk({ id: "x" }), "none", TODAY)).toBe(true);
    expect(matchesDue(mk({ id: "x" }), "week", TODAY)).toBe(false);
  });
});

describe("applyFilter", () => {
  it("filters status, priority, category", () => {
    expect(applyFilter(LIST, { ...initialFilter, status: "pending" })).toHaveLength(3);
    expect(
      applyFilter(LIST, { ...initialFilter, priority: "high" }).map((t) => t.id),
    ).toEqual(["2"]);
    expect(
      applyFilter(LIST, { ...initialFilter, categoryId: "c1" }),
    ).toHaveLength(2);
  });

  it("filters tags case-insensitively (AND)", () => {
    const tasks = [mk({ id: "1", tags: ["Casa", "urgente"] }), mk({ id: "2", tags: ["casa"] })];
    expect(
      applyFilter(tasks, { ...initialFilter, tags: ["casa"] }).map((t) => t.id),
    ).toEqual(["1", "2"]);
    expect(
      applyFilter(tasks, { ...initialFilter, tags: ["casa", "URGENTE"] }).map((t) => t.id),
    ).toEqual(["1"]);
  });

  it("combines every dimension", () => {
    const out = applyFilter(
      LIST,
      {
        ...initialFilter,
        status: "pending",
        priority: "medium",
        categoryId: "c1",
        query: "bola",
        due: "overdue",
      },
      TODAY,
    );
    expect(out.map((t) => t.id)).toEqual(["3"]);
  });
});

describe("applySort", () => {
  it("orders manual / priority / dueDate / alpha", () => {
    expect(applySort(LIST, "manual").map((t) => t.id)).toEqual(["2", "3", "1", "4"]);
    expect(applySort(LIST, "priority").map((t) => t.id)).toEqual(["2", "3", "1", "4"]);
    expect(applySort(LIST, "dueDate").map((t) => t.id)).toEqual(["3", "4", "2", "1"]);
    expect(applySort(LIST, "alpha").map((t) => t.id)).toEqual(["3", "4", "2", "1"]);
  });

  it("orders by creation desc", () => {
    const tasks = [
      mk({ id: "a", createdAt: "2026-01-01T00:00:00.000Z" }),
      mk({ id: "b", createdAt: "2026-02-01T00:00:00.000Z" }),
    ];
    expect(applySort(tasks, "created").map((t) => t.id)).toEqual(["b", "a"]);
  });
});

describe("selectors", () => {
  it("selectFilteredTasks composes filter + sort", () => {
    const out = selectFilteredTasks({
      tasks: LIST,
      filter: { ...initialFilter, query: "zebra" },
      sort: "manual",
    });
    expect(out.map((t) => t.id)).toEqual(["1"]);
  });

  it("selectTaskStats counts overdue only when pending", () => {
    const stats = selectTaskStats(LIST);
    expect(stats).toMatchObject({ total: 4, completed: 1, pending: 3 });
    expect(stats.overdue).toBeGreaterThanOrEqual(1);
  });

  it("selectAllTags ranks by frequency", () => {
    const counts = selectAllTags([
      mk({ id: "1", tags: ["b", "a"] }),
      mk({ id: "2", tags: ["B", "c"] }),
      mk({ id: "3", tags: ["a"] }),
    ]);
    expect(counts.map((t) => `${t.tag}:${t.count}`).join()).toBe("a:2,b:2,c:1");
  });

  it("isFilterDefault detects any active slice", () => {
    expect(isFilterDefault(initialFilter)).toBe(true);
    expect(isFilterDefault({ ...initialFilter, tags: ["x"] })).toBe(false);
    expect(isFilterDefault({ ...initialFilter, due: "today" })).toBe(false);
  });
});
