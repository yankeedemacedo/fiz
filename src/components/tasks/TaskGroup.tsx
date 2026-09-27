import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { groupDropId } from "./groups";
import { cn } from "@/lib/cn";

interface TaskGroupProps {
  /** Category id, or undefined for the uncategorized group. */
  categoryId: string | undefined;
  title: string;
  color?: string;
  count: number;
  collapsed: boolean;
  onToggle: () => void;
  /** True while any drag is active — reveals the empty-group drop zone. */
  dragging: boolean;
  children: ReactNode;
}

export function TaskGroup({
  categoryId,
  title,
  color,
  count,
  collapsed,
  onToggle,
  dragging,
  children,
}: TaskGroupProps) {
  const { setNodeRef, isOver } = useDroppable({ id: groupDropId(categoryId) });

  return (
    <section aria-label={title}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
        className="flex w-full cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 text-left transition-colors hover:bg-surface-2"
      >
        {color ? (
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
        ) : null}
        <span className="flex-1 truncate text-[13px] font-semibold text-text">
          {title}
        </span>
        <span className="font-mono text-xs text-text-muted tabular-nums">
          {count}
        </span>
        <ChevronDown
          size={15}
          aria-hidden
          className={cn(
            "text-text-muted transition-transform duration-fast",
            collapsed && "-rotate-90",
          )}
        />
      </button>
      {!collapsed && (
        <>
          {children}
          <div
            ref={setNodeRef}
            aria-hidden={!dragging}
            className={cn(
              "mt-2 rounded-lg border border-dashed text-center text-xs transition-all",
              dragging
                ? cn(
                    "border-primary-400 px-4 py-3 text-text-muted",
                    isOver && "border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-200",
                  )
                : "hidden",
            )}
          >
            {count === 0 ? "Arraste tarefas para cá" : "Soltar no fim do grupo"}
          </div>
        </>
      )}
    </section>
  );
}
