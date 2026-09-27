import { useState } from "react";
import { Check, Pencil, Plus, X } from "lucide-react";
import { useTaskStore } from "@/store";
import type { Subtask } from "@/types";
import { cn } from "@/lib/cn";

export function SubtaskList({
  taskId,
  subtasks,
}: {
  taskId: string;
  subtasks: Subtask[];
}) {
  const addSubtask = useTaskStore((s) => s.addSubtask);
  const toggleSubtask = useTaskStore((s) => s.toggleSubtask);
  const renameSubtask = useTaskStore((s) => s.renameSubtask);
  const deleteSubtask = useTaskStore((s) => s.deleteSubtask);

  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const done = subtasks.filter((s) => s.completed).length;

  const commitAdd = () => {
    if (addSubtask(taskId, draft)) setDraft("");
  };

  return (
    <section aria-label="Subtarefas">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-text">Subtarefas</h3>
        {subtasks.length > 0 && (
          <span className="font-mono text-xs text-text-muted tabular-nums" aria-live="polite">
            {done}/{subtasks.length}
          </span>
        )}
      </div>

      {subtasks.length > 0 && (
        <div
          className="mb-2 h-1.5 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuenow={done}
          aria-valuemin={0}
          aria-valuemax={subtasks.length}
          aria-label="Progresso das subtarefas"
        >
          <div
            className="h-full rounded-full bg-primary-500 transition-[width] duration-slow ease-out-expo"
            style={{ width: `${(done / subtasks.length) * 100}%` }}
          />
        </div>
      )}

      <ul className="space-y-1">
        {subtasks.map((st) => (
          <li
            key={st.id}
            className="group/sub flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-surface-2/60"
          >
            <button
              type="button"
              role="checkbox"
              aria-checked={st.completed}
              aria-label={st.completed ? `Reabrir "${st.title}"` : `Concluir "${st.title}"`}
              onClick={() => toggleSubtask(taskId, st.id)}
              className={cn(
                "flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-all duration-fast active:scale-90",
                st.completed
                  ? "border-transparent bg-primary-700 text-white"
                  : "border-text-muted/50 hover:border-primary-500",
              )}
            >
              {st.completed && <Check size={13} strokeWidth={3} aria-hidden />}
            </button>
            {editingId === st.id ? (
              <input
                data-autofocus
                aria-label="Renomear subtarefa"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => {
                  renameSubtask(taskId, st.id, editValue);
                  setEditingId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    renameSubtask(taskId, st.id, editValue);
                    setEditingId(null);
                  } else if (e.key === "Escape") {
                    setEditingId(null);
                  }
                }}
                className="h-7 min-w-0 flex-1 rounded border border-primary-500 bg-surface px-2 text-sm text-text"
              />
            ) : (
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-sm",
                  st.completed ? "text-text-muted line-through" : "text-text",
                )}
              >
                {st.title}
              </span>
            )}
            <span className="flex shrink-0 gap-0.5 md:opacity-0 md:group-hover/sub:opacity-100 md:group-focus-within/sub:opacity-100">
              <button
                type="button"
                aria-label={`Renomear "${st.title}"`}
                onClick={() => {
                  setEditingId(st.id);
                  setEditValue(st.title);
                }}
                className="cursor-pointer rounded p-1.5 text-text-muted transition-colors hover:text-text"
              >
                <Pencil size={13} aria-hidden />
              </button>
              <button
                type="button"
                aria-label={`Excluir "${st.title}"`}
                onClick={() => deleteSubtask(taskId, st.id)}
                className="cursor-pointer rounded p-1.5 text-text-muted transition-colors hover:text-red-500"
              >
                <X size={14} aria-hidden />
              </button>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex gap-1.5">
        <label htmlFor={`subtask-new-${taskId}`} className="sr-only">
          Nova subtarefa
        </label>
        <input
          id={`subtask-new-${taskId}`}
          type="text"
          placeholder="Nova subtarefa…"
          value={draft}
          maxLength={120}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitAdd();
            }
          }}
          className="h-9 min-w-0 flex-1 rounded-md border border-border bg-surface px-2.5 text-sm text-text placeholder:text-text-muted transition-colors hover:border-text-muted focus:border-primary-500"
        />
        <button
          type="button"
          aria-label="Adicionar subtarefa"
          onClick={commitAdd}
          disabled={!draft.trim()}
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md bg-surface-2 text-text transition-colors hover:bg-border disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={16} aria-hidden />
        </button>
      </div>
    </section>
  );
}
