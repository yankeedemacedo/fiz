import { useState } from "react";
import { BookmarkPlus, X } from "lucide-react";
import {
  isFilterDefault,
  selectAllTags,
  useTaskStore,
} from "@/store";
import type { DueFilter, TaskPriority } from "@/types";
import { Button, Card, Input, Modal } from "../ui";
import { cn } from "@/lib/cn";

const PRIORITY_LABELS: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

const DUE_LABELS: Record<DueFilter, string> = {
  all: "Qualquer data",
  overdue: "Vencidas",
  today: "Vencem hoje",
  week: "Próximos 7 dias",
  none: "Sem data",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendentes",
  completed: "Concluídas",
};

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 py-0.5 pr-1 pl-2.5 text-xs font-medium text-primary-800 dark:bg-primary-950 dark:text-primary-200">
      {label}
      <button
        type="button"
        aria-label={`Remover filtro ${label}`}
        onClick={onClear}
        className="cursor-pointer rounded-full p-0.5 transition-colors hover:bg-primary-200 dark:hover:bg-primary-900"
      >
        <X size={12} aria-hidden />
      </button>
    </span>
  );
}

export function FilterBar() {
  const filter = useTaskStore((s) => s.filter);
  const setFilter = useTaskStore((s) => s.setFilter);
  const clearFilters = useTaskStore((s) => s.clearFilters);
  const tasks = useTaskStore((s) => s.tasks);
  const categories = useTaskStore((s) => s.categories);
  const addSavedView = useTaskStore((s) => s.addSavedView);

  const [saving, setSaving] = useState(false);
  const [viewName, setViewName] = useState("");
  const [viewError, setViewError] = useState<string | null>(null);

  const usedTags = selectAllTags(tasks).map((t) => t.tag);
  const hasActive = !isFilterDefault(filter);
  const categoryName = categories.find((c) => c.id === filter.categoryId)?.name;

  const toggleTag = (tag: string) => {
    const has = filter.tags.some((t) => t.toLowerCase() === tag.toLowerCase());
    setFilter({
      tags: has
        ? filter.tags.filter((t) => t.toLowerCase() !== tag.toLowerCase())
        : [...filter.tags, tag],
    });
  };

  const saveView = () => {
    if (!viewName.trim()) {
      setViewError("Dê um nome para a vista.");
      return;
    }
    addSavedView(viewName);
    setViewName("");
    setViewError(null);
    setSaving(false);
  };

  const selectClass =
    "h-9 rounded-md border border-border bg-surface px-2 text-xs text-text transition-colors duration-fast hover:border-text-muted focus:border-primary-500";

  return (
    <>
      <Card elevation={1} padding="sm" aria-label="Filtros">
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-1.5 text-xs text-text-muted">
            Prioridade
            <select
              aria-label="Filtrar por prioridade"
              value={filter.priority}
              onChange={(e) =>
                setFilter({ priority: e.target.value as TaskPriority | "all" })
              }
              className={selectClass}
            >
              <option value="all">Todas</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
          </label>
          <label className="inline-flex items-center gap-1.5 text-xs text-text-muted">
            Data
            <select
              aria-label="Filtrar por vencimento"
              value={filter.due}
              onChange={(e) => setFilter({ due: e.target.value as DueFilter })}
              className={selectClass}
            >
              {(Object.keys(DUE_LABELS) as DueFilter[]).map((d) => (
                <option key={d} value={d}>
                  {DUE_LABELS[d]}
                </option>
              ))}
            </select>
          </label>
          {hasActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setViewName("");
                setViewError(null);
                setSaving(true);
              }}
              className="ml-auto"
            >
              <BookmarkPlus size={15} aria-hidden /> Salvar vista
            </Button>
          )}
        </div>

        {usedTags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-text-muted">Tags:</span>
            {usedTags.map((tag) => {
              const on = filter.tags.some(
                (t) => t.toLowerCase() === tag.toLowerCase(),
              );
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "cursor-pointer rounded-full px-2.5 py-1 font-mono text-[11px] transition-colors duration-fast",
                    on
                      ? "bg-primary-700 text-white"
                      : "bg-surface-2 text-text-muted hover:text-text",
                  )}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        )}

        {hasActive && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-border pt-2.5">
            {filter.query && (
              <Chip label={`“${filter.query}”`} onClear={() => setFilter({ query: "" })} />
            )}
            {filter.status !== "all" && (
              <Chip
                label={STATUS_LABELS[filter.status] ?? filter.status}
                onClear={() => setFilter({ status: "all" })}
              />
            )}
            {filter.categoryId !== "all" && (
              <Chip
                label={categoryName ?? "Categoria"}
                onClear={() => setFilter({ categoryId: "all" })}
              />
            )}
            {filter.priority !== "all" && (
              <Chip
                label={PRIORITY_LABELS[filter.priority] ?? filter.priority}
                onClear={() => setFilter({ priority: "all" })}
              />
            )}
            {filter.due !== "all" && (
              <Chip
                label={DUE_LABELS[filter.due]}
                onClear={() => setFilter({ due: "all" })}
              />
            )}
            {filter.tags.map((tag) => (
              <Chip key={tag} label={`#${tag}`} onClear={() => toggleTag(tag)} />
            ))}
            <button
              type="button"
              onClick={clearFilters}
              className="cursor-pointer text-xs font-medium text-text-muted underline-offset-2 transition-colors hover:text-text hover:underline"
            >
              Limpar tudo
            </button>
          </div>
        )}
      </Card>

      <Modal
        open={saving}
        onClose={() => setSaving(false)}
        title="Salvar vista atual"
      >
        <p className="mb-3 text-sm text-text-muted">
          Salva filtros e ordenação atuais para acesso rápido na barra lateral.
        </p>
        <Input
          data-autofocus
          aria-label="Nome da vista"
          placeholder="Ex.: Urgentes da semana"
          value={viewName}
          invalid={viewError !== null}
          onChange={(e) => {
            setViewName(e.target.value);
            if (viewError) setViewError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              saveView();
            }
          }}
        />
        {viewError && (
          <p role="alert" className="mt-1.5 text-xs text-red-500">
            {viewError}
          </p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setSaving(false)}>
            Cancelar
          </Button>
          <Button onClick={saveView}>Salvar</Button>
        </div>
      </Modal>
    </>
  );
}
