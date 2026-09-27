import { memo } from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Copy,
  GripVertical,
  Trash2,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { isOverdue, useTaskStore } from "@/store";
import type { Subtask, Task } from "@/types";
import { useDeleteTask } from "@/hooks/useDeleteTask";
import { formatAbsoluteDue, formatRelativeDue } from "@/lib/dates";
import { Badge, priorityTone } from "../ui";
import { cn } from "@/lib/cn";

function DueChip({ task }: { task: Task }) {
  if (!task.dueDate) return null;
  const overdue = isOverdue(task);
  const relative = formatRelativeDue(task.dueDate);
  return (
    <span
      title={formatAbsoluteDue(task.dueDate)}
      className={cn(
        "inline-flex items-center gap-1 text-xs",
        overdue
          ? "font-medium text-red-500"
          : relative === "hoje" || relative === "amanhã"
            ? "font-medium text-amber-600 dark:text-amber-400"
            : "text-text-muted",
      )}
    >
      <CalendarDays size={13} aria-hidden />
      {overdue ? `atrasada · ${relative}` : relative}
    </span>
  );
}

function SubtaskProgress({ subtasks }: { subtasks: Subtask[] }) {
  const done = subtasks.filter((s) => s.completed).length;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-text-muted"
      role="progressbar"
      aria-valuenow={done}
      aria-valuemin={0}
      aria-valuemax={subtasks.length}
      aria-label={`${done} de ${subtasks.length} subtarefas concluídas`}
    >
      <span aria-hidden className="h-1 w-12 overflow-hidden rounded-full bg-surface-2">
        <span
          aria-hidden
          className="block h-full rounded-full bg-primary-500 transition-[width] duration-base"
          style={{ width: `${(done / subtasks.length) * 100}%` }}
        />
      </span>
      {done}/{subtasks.length}
    </span>
  );
}

export const TaskItem = memo(function TaskItem({
  task,
  index,
  sortable,
}: {
  task: Task;
  index: number;
  sortable: boolean;
}) {
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const duplicateTask = useTaskStore((s) => s.duplicateTask);
  const openDetail = useTaskStore((s) => s.openDetail);
  const removeTask = useDeleteTask();
  const category = useTaskStore((s) =>
    task.categoryId
      ? (s.categories.find((c) => c.id === task.categoryId) ?? null)
      : null,
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !sortable });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        animationDelay: `${Math.min(index, 12) * 25}ms`,
      }}
      className={cn(
        "group animate-rise rounded-lg border border-border bg-surface p-3 shadow-elevation-1 transition-colors duration-base ease-out-expo sm:p-3.5",
        isDragging && "relative z-10 border-primary-400 opacity-40",
      )}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        {sortable && (
          <button
            type="button"
            title="Arrastar para reordenar"
            aria-label={`Reordenar "${task.title}"`}
            {...attributes}
            {...listeners}
            className="mt-0.5 shrink-0 cursor-grab touch-none rounded p-1 text-text-muted/60 transition-colors hover:bg-surface-2 hover:text-text active:cursor-grabbing"
          >
            <GripVertical size={16} aria-hidden />
          </button>
        )}
        <button
          type="button"
          role="checkbox"
          aria-checked={task.isCompleted}
          aria-label={task.isCompleted ? `Reabrir "${task.title}"` : `Concluir "${task.title}"`}
          onClick={() => toggleTask(task.id)}
          className={cn(
            "mt-0.5 flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-all duration-fast ease-out-expo active:scale-90",
            task.isCompleted
              ? "border-transparent bg-primary-700 text-white hover:bg-primary-800"
              : "border-text-muted/50 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950",
          )}
        >
          {task.isCompleted && <Check size={14} strokeWidth={3} aria-hidden />}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm font-medium wrap-break-word transition-colors",
              task.isCompleted ? "text-text-muted line-through" : "text-text",
            )}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="mt-0.5 line-clamp-2 text-[13px] text-text-muted wrap-break-word">
              {task.description}
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            {category && (
              <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                <span
                  aria-hidden
                  className="size-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </span>
            )}
            {task.priority && task.priority !== "low" && (
              <Badge tone={priorityTone[task.priority]}>
                {task.priority === "high" ? "Alta" : "Média"}
              </Badge>
            )}
            <DueChip task={task} />
            {(task.tags ?? []).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-text-muted"
              >
                #{tag}
              </span>
            ))}
            {(task.subtasks?.length ?? 0) > 0 && (
              <SubtaskProgress subtasks={task.subtasks ?? []} />
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 md:opacity-0 md:transition-opacity md:duration-fast md:group-hover:opacity-100 md:group-focus-within:opacity-100">
          <button
            type="button"
            aria-label={`Ver detalhes de "${task.title}"`}
            title="Detalhes"
            onClick={() => openDetail(task.id)}
            className="cursor-pointer rounded-md p-2 text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
          >
            <ChevronRight size={17} aria-hidden />
          </button>
          <button
            type="button"
            aria-label={`Duplicar "${task.title}"`}
            title="Duplicar"
            onClick={() => duplicateTask(task.id)}
            className="cursor-pointer rounded-md p-2 text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
          >
            <Copy size={16} aria-hidden />
          </button>
          <button
            type="button"
            aria-label={`Excluir "${task.title}"`}
            title="Excluir"
            onClick={() => removeTask(task)}
            className="cursor-pointer rounded-md p-2 text-text-muted transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
          >
            <Trash2 size={16} aria-hidden />
          </button>
        </div>
      </div>
    </li>
  );
});
