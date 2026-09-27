import { useEffect, useRef, useState } from "react";
import { useTaskStore } from "@/store";

export type AutosaveStatus = "saved" | "saving";

const DEBOUNCE_MS = 400;

/**
 * Inline field editor with debounced auto-save.
 * Syncs when the stored value changes elsewhere (other tab, DnD adopt).
 */
export function useAutosave(
  taskId: string,
  field: "title" | "description",
  current: string,
  opts?: { canSave?: (v: string) => boolean },
) {
  const updateTask = useTaskStore((s) => s.updateTask);
  const [value, setValue] = useState(current);
  const [status, setStatus] = useState<AutosaveStatus>("saved");
  const timer = useRef<number | null>(null);
  const skipNext = useRef(false);

  // External change (other tab / another component) wins.
  useEffect(() => {
    skipNext.current = true;
    setValue(current);
    setStatus("saved");
  }, [taskId, current]);

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    if (value === current) return;
    if (opts?.canSave && !opts.canSave(value)) return;
    setStatus("saving");
    timer.current = window.setTimeout(() => {
      updateTask(taskId, { [field]: value });
      setStatus("saved");
    }, DEBOUNCE_MS);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, taskId, field]);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  return { value, setValue, status };
}
