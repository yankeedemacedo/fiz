import { describe, expect, it } from "vitest";
import {
  defaultCategories,
  hasPersistedStore,
  loadSeedCategories,
  loadSeedTasks,
  migrateLegacyTasks,
  STORE_KEY,
} from "@/store/migrate";
import { resetStore } from "@/test/helpers";

describe("migrateLegacyTasks", () => {
  it("migrates valid entries with order + timestamps", () => {
    const out = migrateLegacyTasks([
      { id: "a", title: "T", description: "d", isCompleted: true },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      id: "a",
      title: "T",
      description: "d",
      isCompleted: true,
      order: 0,
    });
    expect(typeof out[0]?.createdAt).toBe("string");
  });

  it("drops garbage, keeps salvageable", () => {
    const out = migrateLegacyTasks([
      { id: "a", title: "ok" },
      { id: "x", title: 42 },
      { title: "no-id" },
      "junk",
      null,
    ]);
    expect(out.map((t) => t.id)).toEqual(["a"]);
  });

  it("rejects non-arrays", () => {
    expect(migrateLegacyTasks(null)).toEqual([]);
    expect(migrateLegacyTasks({})).toEqual([]);
  });
});

describe("first-run seeding", () => {
  it("seeds legacy tasks + default categories once", () => {
    resetStore();
    localStorage.setItem(
      "tasks",
      JSON.stringify([{ id: "a", title: "T", description: "", isCompleted: false }]),
    );
    expect(loadSeedTasks().map((t) => t.id)).toEqual(["a"]);
    expect(loadSeedCategories()).toHaveLength(3);
    expect(defaultCategories().map((c) => c.name)).toContain("Pessoal");
  });

  it("seeds nothing after the store persisted", () => {
    resetStore();
    localStorage.setItem(STORE_KEY, JSON.stringify({ state: { tasks: [] }, version: 1 }));
    expect(hasPersistedStore()).toBe(true);
    expect(loadSeedTasks()).toEqual([]);
    expect(loadSeedCategories()).toEqual([]);
  });
});
