import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAutosave } from "@/components/detail/useAutosave";
import { useTaskStore } from "@/store/taskStore";
import { resetStore } from "@/test/helpers";

beforeEach(() => {
  resetStore();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useAutosave", () => {
  it("debounces writes and reports saving/saved", () => {
    const t = useTaskStore.getState().addTask({ title: "A", description: "" });
    const { result } = renderHook(() => useAutosave(t.id, "title", "A"));

    act(() => {
      result.current.setValue("AB");
    });
    expect(result.current.status).toBe("saving");
    expect(useTaskStore.getState().tasks[0]?.title).toBe("A");

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(useTaskStore.getState().tasks[0]?.title).toBe("AB");
    expect(result.current.status).toBe("saved");
  });

  it("rejects empty titles via canSave", () => {
    const t = useTaskStore.getState().addTask({ title: "A", description: "" });
    const { result } = renderHook(() =>
      useAutosave(t.id, "title", "A", { canSave: (v) => v.trim() !== "" }),
    );
    act(() => {
      result.current.setValue("   ");
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(useTaskStore.getState().tasks[0]?.title).toBe("A");
  });
});
