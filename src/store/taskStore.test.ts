import { beforeEach, describe, expect, it } from "vitest";
import { initialFilter, useTaskStore } from "@/store/taskStore";
import { STORE_KEY } from "@/store/migrate";
import { resetStore } from "@/test/helpers";

beforeEach(resetStore);

function tasks() {
  return useTaskStore.getState().tasks;
}

describe("tasks", () => {
  it("creates → edits → completes → deletes → undoes", () => {
    const api = useTaskStore.getState();
    const t = api.addTask({ title: "T", description: "d" });
    expect(t).toMatchObject({ priority: "medium", order: 0, dueDate: null });

    useTaskStore.getState().updateTask(t.id, { title: "T2" });
    expect(tasks()[0]?.title).toBe("T2");

    useTaskStore.getState().toggleTask(t.id);
    expect(tasks()[0]?.isCompleted).toBe(true);

    useTaskStore.getState().deleteTask(t.id);
    expect(tasks()).toHaveLength(0);

    useTaskStore.getState().undoDelete();
    expect(tasks().map((x) => x.id)).toEqual([t.id]);
    expect(tasks().map((x) => x.order)).toEqual([0]);
  });

  it("undo restores the original position", () => {
    const api = useTaskStore.getState();
    const a = api.addTask({ title: "a", description: "" });
    api.addTask({ title: "b", description: "" });
    api.addTask({ title: "c", description: "" });
    useTaskStore.getState().deleteTask(a.id);
    useTaskStore.getState().undoDelete();
    expect(tasks().map((t) => t.title)).toEqual(["a", "b", "c"]);
  });

  it("duplicates with fresh ids and reset state", () => {
    const api = useTaskStore.getState();
    const t = api.addTask({ title: "T", description: "" });
    useTaskStore.getState().addSubtask(t.id, "sub");
    const copy = useTaskStore.getState().duplicateTask(t.id);
    expect(copy).toBeDefined();
    expect(copy?.id).not.toBe(t.id);
    expect(copy?.title).toBe("T (cópia)");
    expect(copy?.subtasks?.[0]?.id).not.toBe(
      tasks().find((x) => x.id === t.id)?.subtasks?.[0]?.id,
    );
    expect(copy?.activity?.map((a) => a.kind)).toEqual(["created"]);
  });

  it("reorders with moveTask and normalizes order", () => {
    const api = useTaskStore.getState();
    const a = api.addTask({ title: "a", description: "" });
    const b = api.addTask({ title: "b", description: "" });
    const c = api.addTask({ title: "c", description: "" });
    useTaskStore.getState().moveTask(c.id, a.id);
    expect(tasks().map((t) => t.id)).toEqual([c.id, a.id, b.id]);
    expect(tasks().map((t) => t.order)).toEqual([0, 1, 2]);
  });

  it("moves tasks across groups adopting the category", () => {
    const api = useTaskStore.getState();
    const a = api.addTask({ title: "a", description: "", categoryId: "c1" });
    api.addTask({ title: "b", description: "", categoryId: "c1" });
    api.addTask({ title: "c", description: "", categoryId: "c2" });
    useTaskStore.getState().moveTaskToGroup(a.id, "c2");
    const moved = tasks().find((t) => t.id === a.id);
    expect(moved?.categoryId).toBe("c2");
    // Lands after the last c2 member.
    expect(tasks().map((t) => t.title)).toEqual(["b", "c", "a"]);
  });

  it("drops into an empty group at the head", () => {
    const api = useTaskStore.getState();
    const a = api.addTask({ title: "a", description: "", categoryId: "c1" });
    api.addTask({ title: "b", description: "", categoryId: "c1" });
    useTaskStore.getState().moveTaskToGroup(a.id, "c9");
    expect(tasks().map((t) => t.id)[0]).toBe(a.id);
    expect(tasks().find((t) => t.id === a.id)?.categoryId).toBe("c9");
  });
});

describe("categories", () => {
  it("deletes unlink tasks and reset the filter", () => {
    const api = useTaskStore.getState();
    const cat = api.addCategory({ name: "X", color: "#fff" });
    const t = api.addTask({ title: "T", description: "", categoryId: cat.id });
    useTaskStore.getState().updateTask(t.id, { categoryId: cat.id });
    useTaskStore.getState().setFilter({ categoryId: cat.id });
    useTaskStore.getState().deleteCategory(cat.id);
    const s = useTaskStore.getState();
    expect(s.categories).toHaveLength(0);
    expect(s.tasks.every((x) => x.categoryId === undefined)).toBe(true);
    expect(s.filter.categoryId).toBe("all");
  });
});

describe("filter + sort + saved views", () => {
  it("patches and clears filters", () => {
    useTaskStore.getState().setFilter({ query: "x", due: "today" });
    expect(useTaskStore.getState().filter.query).toBe("x");
    useTaskStore.getState().clearFilters();
    expect(useTaskStore.getState().filter).toEqual(initialFilter);
  });

  it("saves, applies and deletes views", () => {
    useTaskStore.getState().setFilter({ priority: "high" });
    useTaskStore.getState().setSort("priority");
    const view = useTaskStore.getState().addSavedView("Urgentes");
    useTaskStore.getState().setFilter({ priority: "all" });
    useTaskStore.getState().applySavedView(view.id);
    expect(useTaskStore.getState().filter.priority).toBe("high");
    expect(useTaskStore.getState().sort).toBe("priority");
    useTaskStore.getState().deleteSavedView(view.id);
    expect(useTaskStore.getState().savedViews).toHaveLength(0);
  });
});

describe("subtasks", () => {
  it("adds, toggles, renames and deletes", () => {
    const api = useTaskStore.getState();
    const t = api.addTask({ title: "T", description: "" });
    expect(api.addSubtask(t.id, "   ")).toBeUndefined();
    const s1 = api.addSubtask(t.id, "um");
    expect(s1?.title).toBe("um");
    useTaskStore.getState().toggleSubtask(t.id, s1?.id ?? "");
    expect(tasks()[0]?.subtasks?.[0]?.completed).toBe(true);
    useTaskStore.getState().renameSubtask(t.id, s1?.id ?? "", "  dois  ");
    expect(tasks()[0]?.subtasks?.[0]?.title).toBe("dois");
    useTaskStore.getState().renameSubtask(t.id, s1?.id ?? "", "   ");
    expect(tasks()[0]?.subtasks?.[0]?.title).toBe("dois");
    useTaskStore.getState().deleteSubtask(t.id, s1?.id ?? "");
    expect(tasks()[0]?.subtasks).toHaveLength(0);
  });
});

describe("activity log", () => {
  it("records meaningful entries and caps at 30", () => {
    const api = useTaskStore.getState();
    const t = api.addTask({ title: "T", description: "" });
    const kinds = () => tasks()[0]?.activity?.map((a) => a.kind) ?? [];
    expect(kinds()).toEqual(["created"]);
    useTaskStore.getState().toggleTask(t.id);
    useTaskStore.getState().toggleTask(t.id);
    expect(kinds().slice(-2)).toEqual(["completed", "reopened"]);
    useTaskStore.getState().updateTask(t.id, { title: "T2" });
    expect(kinds().at(-1)).toBe("renamed");
    useTaskStore.getState().updateTask(t.id, { description: "x" });
    expect(kinds().at(-1)).toBe("edited");
    for (let i = 0; i < 40; i++) useTaskStore.getState().updateTask(t.id, { description: `d${i}` });
    expect(tasks()[0]?.activity).toHaveLength(30);
  });
});

describe("persistence", () => {
  it("persists data slices only and rehydrates", async () => {
    const api = useTaskStore.getState();
    api.addTask({ title: "T", description: "" });
    api.pushToast("hi");
    const raw = localStorage.getItem(STORE_KEY) ?? "";
    expect(raw).toContain("T");
    expect(raw).not.toContain("toasts");
    expect(raw).not.toContain("lastDeleted");

    const parsed = JSON.parse(raw) as { state: { tasks: { title: string }[] } };
    parsed.state.tasks[0]!.title = "TAMPERED";
    localStorage.setItem(STORE_KEY, JSON.stringify(parsed));
    await useTaskStore.persist.rehydrate();
    expect(tasks()[0]?.title).toBe("TAMPERED");
  });
});

describe("ui state", () => {
  it("opens and closes detail + sidebar + manager", () => {
    const api = useTaskStore.getState();
    api.openDetail("x");
    expect(useTaskStore.getState().detailId).toBe("x");
    api.closeDetail();
    expect(useTaskStore.getState().detailId).toBeNull();
    api.setSidebarOpen(true);
    api.setManagerOpen(true);
    expect(useTaskStore.getState().sidebarOpen).toBe(true);
    expect(useTaskStore.getState().managerOpen).toBe(true);
  });
});
