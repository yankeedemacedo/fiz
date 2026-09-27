import { useState } from "react";
import { Check, Copy, Trash2 } from "lucide-react";
import { useTaskStore } from "@/store";
import type { Task, TaskPriority } from "@/types";
import { Button, Modal } from "../ui";
import { TagsInput } from "../tags/TagsInput";
import { useAutosave } from "./useAutosave";
import { useDeleteTask } from "@/hooks/useDeleteTask";
import { SubtaskList } from "./SubtaskList";
import { ActivityTimeline } from "./ActivityTimeline";
import { cn } from "@/lib/cn";

const PRIORITIES: { id: TaskPriority; label: string }[] = [
  { id: "low", label: "Baixa" },
  { id: "medium", label: "Média" },
  { id: "high", label: "Alta" },
];

function DetailBody({ task }: { task: Task }) {
  const updateTask = useTaskStore((s) => s.updateTask);
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const removeTask = useDeleteTask();
  const duplicateTask = useTaskStore((s) => s.duplicateTask);
  const openDetail = useTaskStore((s) => s.openDetail);
  const closeDetail = useTaskStore((s) => s.closeDetail);
  const categories = useTaskStore((s) => s.categories);

  const title = useAutosave(task.id, "title", task.title, {
    canSave: (v) => v.trim() !== "",
  });
  const description = useAutosave(task.id, "description", task.description);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const saving = title.status === "saving" || description.status === "saving";

  const field =
    "rounded-md border border-transparent bg-transparent transition-colors duration-fast hover:border-border hover:bg-surface-2/50 focus:border-primary-500 focus:bg-surface";

  return (
    <div className="space-y-5 max-w-md">
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          role="checkbox"
          aria-checked={task.isCompleted}
          aria-label={task.isCompleted ? "Reabrir tarefa" : "Concluir tarefa"}
          onClick={() => toggleTask(task.id)}
          className={cn(
            "mt-1.5 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-all duration-fast active:scale-90",
            task.isCompleted
              ? "border-transparent bg-primary-700 text-white hover:bg-primary-800"
              : "border-text-muted/50 hover:border-primary-500",
          )}
        >
          {task.isCompleted && <Check size={16} strokeWidth={3} aria-hidden />}
        </button>
        <div className="min-w-0 flex-1">
          <label htmlFor="detail-title" className="sr-only">Título</label>
          <input
            id="detail-title"
            value={title.value}
            onChange={(e) => title.setValue(e.target.value)}
            onBlur={() => { if (title.value.trim() === "") title.setValue(task.title); }}
            className={cn(field, "-ml-2 px-2 py-1 text-lg font-semibold text-text", task.isCompleted && "text-text-muted line-through")}
          />
          <p aria-live="polite" className="mt-0.5 h-4 text-xs text-text-muted">
            {saving ? "Salvando…" : "Salvo"}
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="detail-description" className="sr-only">Descrição</label>
        <textarea
          id="detail-description"
          value={description.value}
          rows={3}
          placeholder="Adicionar descrição…"
          onChange={(e) => description.setValue(e.target.value)}
          className={cn(field, "-ml-2 w-full resize-y px-2 py-1.5 text-sm text-text placeholder:text-text-muted")}
        />
      </div>

      <div className="space-y-3 rounded-lg border border-border p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] text-text-muted">Status</span>
          <Button variant="secondary" size="sm" onClick={() => toggleTask(task.id)}>
            {task.isCompleted ? "Reabrir" : "Concluir"}
          </Button>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span id="detail-priority-label" className="text-[13px] text-text-muted">Prioridade</span>
          <div role="group" aria-labelledby="detail-priority-label" className="flex overflow-hidden rounded-md border border-border">
            {PRIORITIES.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={(task.priority ?? "medium") === p.id}
                onClick={() => updateTask(task.id, { priority: p.id })}
                className={cn(
                  "h-8 cursor-pointer px-2.5 text-xs font-medium transition-colors duration-fast",
                  (task.priority ?? "medium") === p.id ? "bg-surface-2 text-text" : "text-text-muted hover:text-text",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="detail-category" className="text-[13px] text-text-muted">Categoria</label>
          <select
            id="detail-category"
            value={task.categoryId ?? ""}
            onChange={(e) => updateTask(task.id, { categoryId: e.target.value || undefined })}
            className="h-9 max-w-48 cursor-pointer rounded-md border border-border bg-surface px-2 text-xs text-text"
          >
            <option value="">Sem categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="detail-due" className="text-[13px] text-text-muted">Vencimento</label>
          <span className="flex items-center gap-1.5">
            <input
              id="detail-due"
              type="date"
              value={task.dueDate?.slice(0, 10) ?? ""}
              onChange={(e) => updateTask(task.id, { dueDate: e.target.value || null })}
              className="h-9 cursor-pointer rounded-md border border-border bg-surface px-2 text-xs text-text"
            />
            {task.dueDate && (
              <button
                type="button"
                aria-label="Remover vencimento"
                onClick={() => updateTask(task.id, { dueDate: null })}
                className="cursor-pointer rounded p-1 text-xs text-text-muted underline-offset-2 hover:text-text hover:underline"
              >
                limpar
              </button>
            )}
          </span>
        </div>
        <div>
          <span id="detail-tags-label" className="mb-1.5 block text-[13px] text-text-muted">Tags</span>
          <div role="group" aria-labelledby="detail-tags-label">
            <TagsInput id={`detail-tags-${task.id}`} value={task.tags ?? []} onChange={(tags) => updateTask(task.id, { tags })} />
          </div>
        </div>
      </div>

      <SubtaskList taskId={task.id} subtasks={task.subtasks ?? []} />

      <ActivityTimeline activity={task.activity} categories={categories} createdAt={task.createdAt} />

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        {confirmDelete ? (
          <>
            <span className="mr-auto self-center text-xs text-text-muted">Excluir esta tarefa?</span>
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
            <Button variant="danger" size="sm" data-autofocus onClick={() => { removeTask(task); closeDetail(); }}>Excluir</Button>
          </>
        ) : (
          <>
            <Button variant="secondary" size="sm" onClick={() => { const copy = duplicateTask(task.id); if (copy) openDetail(copy.id); }}>
              <Copy size={15} aria-hidden /> Duplicar
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={15} aria-hidden /> Excluir
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function TaskDetail() {
  const detailId = useTaskStore((s) => s.detailId);
  const closeDetail = useTaskStore((s) => s.closeDetail);
  const task = useTaskStore((s) => detailId ? (s.tasks.find((t) => t.id === detailId) ?? null) : null);

  return (
    <Modal
      open={detailId !== null}
      onClose={closeDetail}
      title={task ? `Detalhes — ${task.title}` : "Detalhes da tarefa"}
      variant="sheet"
    >
      {task ? (
        <DetailBody key={task.id} task={task} />
      ) : (
        <div className="text-center">
          <p className="font-medium text-text">Tarefa não encontrada</p>
          <p className="mt-1 text-sm text-text-muted">Ela pode ter sido excluída em outra aba.</p>
          <Button className="mt-4" onClick={closeDetail}>Fechar</Button>
        </div>
      )}
    </Modal>
  );
}
