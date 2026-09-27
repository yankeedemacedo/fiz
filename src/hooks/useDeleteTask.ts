import { useCallback } from "react";
import { useTaskStore } from "@/store";
import type { Task } from "@/types";

/** Deletes a task and offers undo via toast. */
export function useDeleteTask() {
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const pushToast = useTaskStore((s) => s.pushToast);
  const undoDelete = useTaskStore((s) => s.undoDelete);

  return useCallback(
    (task: Pick<Task, "id" | "title">) => {
      deleteTask(task.id);
      const short =
        task.title.length > 42 ? `${task.title.slice(0, 42)}…` : task.title;
      pushToast(`“${short}” excluída`, {
        label: "Desfazer",
        onClick: () => undoDelete(),
      });
    },
    [deleteTask, pushToast, undoDelete],
  );
}
