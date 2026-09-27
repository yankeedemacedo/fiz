import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useFilteredTasks, isFilterDefault, useTaskStore } from "@/store";
import type { Task } from "@/types";
import { TaskItem } from "./TaskItem";
import { EmptyState } from "./EmptyState";
import { SortSelect } from "./SortSelect";
import { TaskGroup } from "./TaskGroup";
import { UNCATEGORIZED_ID, parseGroupDropId } from "./groups";

interface Group {
  categoryId: string | undefined;
  title: string;
  color?: string;
  items: Task[];
}

const announcements = (tasks: Task[]) => {
  const titleOf = (id: string | number) =>
    tasks.find((t) => t.id === String(id))?.title ?? "tarefa";
  return {
    onDragStart: ({ active }: { active: { id: string | number } }) =>
      `Arrastando ${titleOf(active.id)}.`,
    onDragOver: ({
      active,
      over,
    }: {
      active: { id: string | number };
      over: { id: string | number } | null;
    }) => (over ? `${titleOf(active.id)} sobre ${titleOf(over.id)}.` : undefined),
    onDragEnd: ({
      active,
      over,
    }: {
      active: { id: string | number };
      over: { id: string | number } | null;
    }) =>
      over
        ? `${titleOf(active.id)} solta sobre ${titleOf(over.id)}.`
        : `${titleOf(active.id)} solta fora da lista.`,
    onDragCancel: ({ active }: { active: { id: string | number } }) =>
      `Movimentação de ${titleOf(active.id)} cancelada.`,
  };
};

export function TaskList() {
  const tasks = useFilteredTasks();
  const total = useTaskStore((s) => s.tasks.length);
  const filter = useTaskStore((s) => s.filter);
  const sort = useTaskStore((s) => s.sort);
  const categories = useTaskStore((s) => s.categories);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const grouped = sort === "manual";
  const canReorder = grouped && isFilterDefault(filter);

  const groups = useMemo<Group[]>(() => {
    if (!grouped) return [];
    const byCat = new Map<string | undefined, Task[]>();
    for (const t of tasks) {
      const key = t.categoryId ?? undefined;
      const arr = byCat.get(key);
      if (arr) arr.push(t);
      else byCat.set(key, [t]);
    }
    const out: Group[] = categories.map((c) => ({
      categoryId: c.id,
      title: c.name,
      color: c.color,
      items: byCat.get(c.id) ?? [],
    }));
    // Tasks whose category was deleted (or never had one) land here.
    const uncategorized = [
      ...(byCat.get(undefined) ?? []),
      ...[...byCat.entries()]
        .filter(([k]) => k !== undefined && !categories.some((c) => c.id === k))
        .flatMap(([, v]) => v),
    ];
    out.push({
      categoryId: undefined,
      title: "Sem categoria",
      items: uncategorized,
    });
    // Hide empty groups unless a drag is in progress (drop targets).
    return out.filter((g) => g.items.length > 0 || activeId !== null);
  }, [grouped, tasks, categories, activeId]);

  const toggleGroup = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const onDragEnd = (e: DragEndEvent) => {
    const dragId = String(e.active.id);
    const overId = e.over ? String(e.over.id) : null;
    setActiveId(null);
    if (!overId || overId === dragId) return;
    const api = useTaskStore.getState();
    // Ordem manual só vale na lista cheia — com filtro, índices do DnD
    // (filtrados) não batem com os da store (completa).
    if (!(api.sort === "manual" && isFilterDefault(api.filter))) return;
    const groupCat = parseGroupDropId(overId);
    if (groupCat !== null) {
      api.moveTaskToGroup(dragId, groupCat ?? undefined);
      return;
    }
    api.moveTask(dragId, overId);
    const overTask = api.tasks.find((t) => t.id === overId);
    const activeTask = api.tasks.find((t) => t.id === dragId);
    const overCat = overTask?.categoryId ?? undefined;
    if (overTask && (activeTask?.categoryId ?? undefined) !== overCat) {
      api.updateTask(dragId, { categoryId: overCat });
    }
  };

  if (tasks.length === 0) {
    return <EmptyState filtered={total > 0} />;
  }

  const activeTask = activeId
    ? tasks.find((t) => t.id === activeId) ?? null
    : null;

  const defaultFilter = isFilterDefault(filter);

  return (
    <section aria-label="Tarefas">
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <p className="text-xs text-text-muted" aria-live="polite">
          {tasks.length === 1 ? "1 tarefa" : `${tasks.length} tarefas`}
          {!defaultFilter && ` (filtradas de ${total})`}
        </p>
        <SortSelect />
      </div>
      {grouped && !canReorder && (
        <p className="mb-2 px-1 text-xs text-text-muted">
          Ordem manual pausada com filtros — limpe os filtros para arrastar.
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
        accessibility={{ announcements: announcements(tasks) }}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {!grouped && (
            <ul className="space-y-2">
              {tasks.map((task, i) => (
                <TaskItem key={task.id} task={task} index={i} sortable={false} />
              ))}
            </ul>
          )}
          {grouped && (
            <div className="space-y-4">
              {groups.map((g) => {
                const key = g.categoryId ?? UNCATEGORIZED_ID;
                return (
                  <TaskGroup
                    key={key}
                    categoryId={g.categoryId}
                    title={g.title}
                    color={g.color}
                    count={g.items.length}
                    collapsed={collapsed.has(key)}
                    onToggle={() => toggleGroup(key)}
                    dragging={activeId !== null && canReorder}
                  >
                    <ul className="space-y-2">
                      {g.items.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          index={0}
                          sortable={canReorder}
                        />
                      ))}
                    </ul>
                  </TaskGroup>
                );
              })}
            </div>
          )}
        </SortableContext>
        <DragOverlay dropAnimation={null}>
          {activeTask && (
            <div className="rotate-1 rounded-lg border border-primary-400 bg-surface p-3 shadow-elevation-3">
              <p className="line-clamp-2 text-sm font-medium text-text">
                {activeTask.title}
              </p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </section>
  );
}
