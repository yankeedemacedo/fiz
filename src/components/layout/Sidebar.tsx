import { useNavigate } from "react-router-dom";
import { Bookmark, Circle, CheckCircle2, ListTodo, Settings2, X } from "lucide-react";
import { useTaskStore, useTaskStats } from "@/store";
import type { TaskStatusFilter } from "@/types";
import { cn } from "@/lib/cn";

const VIEWS: { id: TaskStatusFilter; label: string; icon: typeof ListTodo }[] = [
  { id: "all", label: "Todas", icon: ListTodo },
  { id: "pending", label: "Pendentes", icon: Circle },
  { id: "completed", label: "Concluídas", icon: CheckCircle2 },
];

export function Sidebar() {
  const navigate = useNavigate();
  const status = useTaskStore((s) => s.filter.status);
  const activeCategory = useTaskStore((s) => s.filter.categoryId);
  const categories = useTaskStore((s) => s.categories);
  const tasks = useTaskStore((s) => s.tasks);
  const stats = useTaskStats();
  const setFilter = useTaskStore((s) => s.setFilter);
  const setSidebarOpen = useTaskStore((s) => s.setSidebarOpen);
  const setManagerOpen = useTaskStore((s) => s.setManagerOpen);
  const savedViews = useTaskStore((s) => s.savedViews);
  const applySavedView = useTaskStore((s) => s.applySavedView);
  const deleteSavedView = useTaskStore((s) => s.deleteSavedView);

  const countFor = (id: TaskStatusFilter) =>
    id === "all"
      ? tasks.length
      : tasks.filter((t) => t.isCompleted === (id === "completed")).length;

  const select = (patch: { status?: TaskStatusFilter; categoryId?: string }) => {
    setFilter(patch);
    setSidebarOpen(false);
    navigate("/");
  };

  const rate = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-4">
      <nav aria-label="Visualizações">
        <p className="mb-2 px-2 text-xs font-semibold tracking-wide text-text-muted uppercase">
          Visualizações
        </p>
        <ul className="space-y-1">
          {VIEWS.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => select({ status: id })}
                aria-current={status === id ? "page" : undefined}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors duration-fast",
                  status === id
                    ? "bg-primary-100 font-medium text-primary-800 dark:bg-primary-950 dark:text-primary-200"
                    : "text-text-muted hover:bg-surface-2 hover:text-text",
                )}
              >
                <Icon size={17} aria-hidden />
                <span className="flex-1 text-left">{label}</span>
                <span className="font-mono text-xs tabular-nums opacity-70">
                  {countFor(id)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <nav aria-label="Categorias">
        <div className="mb-2 flex items-center justify-between px-2">
          <p className="text-xs font-semibold tracking-wide text-text-muted uppercase">
            Categorias
          </p>
          <button
            type="button"
            aria-label="Gerenciar categorias"
            title="Gerenciar categorias"
            onClick={() => setManagerOpen(true)}
            className="cursor-pointer rounded p-1 text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
          >
            <Settings2 size={14} aria-hidden />
          </button>
        </div>
        {categories.length === 0 ? (
          <p className="px-2 text-sm text-text-muted">Sem categorias.</p>
        ) : (
          <ul className="space-y-1">
            {categories.map((c) => {
              const count = tasks.filter((t) => t.categoryId === c.id).length;
              const active = activeCategory === c.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() =>
                      select({ categoryId: active ? "all" : c.id })
                    }
                    aria-pressed={active}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors duration-fast",
                      active
                        ? "bg-primary-100 font-medium text-primary-800 dark:bg-primary-950 dark:text-primary-200"
                        : "text-text-muted hover:bg-surface-2 hover:text-text",
                    )}
                  >
                    <span
                      aria-hidden
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="flex-1 truncate text-left">{c.name}</span>
                    <span className="font-mono text-xs tabular-nums opacity-70">
                      {count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      {savedViews.length > 0 && (
        <nav aria-label="Vistas salvas">
          <p className="mb-2 px-2 text-xs font-semibold tracking-wide text-text-muted uppercase">
            Vistas salvas
          </p>
          <ul className="space-y-1">
            {savedViews.map((v) => (
              <li key={v.id} className="group/view flex items-center gap-1">
                <button
                  type="button"
                  title={v.name}
                  onClick={() => {
                    applySavedView(v.id);
                    setSidebarOpen(false);
                    navigate("/");
                  }}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-text-muted transition-colors duration-fast hover:bg-surface-2 hover:text-text"
                >
                  <Bookmark size={15} aria-hidden className="shrink-0" />
                  <span className="flex-1 truncate text-left">{v.name}</span>
                </button>
                <button
                  type="button"
                  aria-label={`Excluir vista ${v.name}`}
                  onClick={() => deleteSavedView(v.id)}
                  className="shrink-0 cursor-pointer rounded p-1.5 text-text-muted transition-colors hover:text-red-500 md:opacity-0 md:group-hover/view:opacity-100"
                >
                  <X size={13} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="mt-auto rounded-md border border-border bg-surface p-3">
        <p className="text-xs text-text-muted" aria-live="polite">
          {stats.completed} de {stats.total} concluídas
        </p>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuenow={rate}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso de conclusão"
        >
          <div
            className="h-full rounded-full bg-primary-500 transition-[width] duration-slow ease-out-expo"
            style={{ width: `${rate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
