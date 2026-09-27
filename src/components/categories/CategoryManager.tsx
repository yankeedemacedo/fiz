import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useTaskStore } from "@/store";
import type { Category } from "@/types";
import { Button, Input, Modal } from "../ui";
import { CategoryIcon } from "./CategoryIcon";
import {
  CATEGORY_ICON_NAMES,
  type CategoryIconName,
} from "./categoryIcons";
import { cn } from "@/lib/cn";

const COLOR_PRESETS = [
  "#0891b2",
  "#7c3aed",
  "#059669",
  "#ea580c",
  "#dc2626",
  "#ca8a04",
  "#db2777",
  "#475569",
];

interface Draft {
  name: string;
  color: string;
  icon: CategoryIconName;
}

function CategoryForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: Draft;
  submitLabel: string;
  onSubmit: (d: Draft) => void;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    if (!draft.name.trim()) {
      setError("A categoria precisa de um nome.");
      return;
    }
    onSubmit({ ...draft, name: draft.name.trim() });
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface-2/40 p-3">
      <Input
        aria-label="Nome da categoria"
        placeholder="Nome da categoria"
        value={draft.name}
        invalid={error !== null}
        onChange={(e) => {
          setDraft({ ...draft, name: e.target.value });
          if (error) setError(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            save();
          }
        }}
      />
      {error && (
        <p role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}
      <div>
        <p id="cat-color-label" className="mb-1.5 text-xs text-text-muted">
          Cor
        </p>
        <div role="group" aria-labelledby="cat-color-label" className="flex flex-wrap items-center gap-1.5">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              aria-label={`Cor ${c}`}
              aria-pressed={draft.color === c}
              onClick={() => setDraft({ ...draft, color: c })}
              style={{ backgroundColor: c }}
              className={cn(
                "size-7 cursor-pointer rounded-full transition-transform hover:scale-110",
                draft.color === c && "ring-2 ring-text ring-offset-2 ring-offset-surface",
              )}
            />
          ))}
          <input
            type="color"
            aria-label="Cor personalizada"
            value={/^#[0-9a-f]{6}$/i.test(draft.color) ? draft.color : "#0891b2"}
            onChange={(e) => setDraft({ ...draft, color: e.target.value })}
            className="size-7 cursor-pointer rounded-full border border-border bg-transparent p-0.5"
          />
        </div>
      </div>
      <div>
        <p id="cat-icon-label" className="mb-1.5 text-xs text-text-muted">
          Ícone
        </p>
        <div role="group" aria-labelledby="cat-icon-label" className="flex flex-wrap gap-1.5">
          {CATEGORY_ICON_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              aria-label={`Ícone ${name}`}
              aria-pressed={draft.icon === name}
              onClick={() => setDraft({ ...draft, icon: name })}
              className={cn(
                "cursor-pointer rounded-md border p-2 transition-colors",
                draft.icon === name
                  ? "border-primary-500 bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-200"
                  : "border-border text-text-muted hover:text-text",
              )}
            >
              <CategoryIcon name={name} />
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button size="sm" onClick={save}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

export function CategoryManager() {
  const open = useTaskStore((s) => s.managerOpen);
  const setManagerOpen = useTaskStore((s) => s.setManagerOpen);
  const categories = useTaskStore((s) => s.categories);
  const tasks = useTaskStore((s) => s.tasks);
  const addCategory = useTaskStore((s) => s.addCategory);
  const updateCategory = useTaskStore((s) => s.updateCategory);
  const deleteCategory = useTaskStore((s) => s.deleteCategory);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const close = () => {
    setManagerOpen(false);
    setEditingId(null);
    setConfirmId(null);
    setCreating(false);
  };

  const countFor = (id: string) =>
    tasks.filter((t) => t.categoryId === id).length;

  return (
    <Modal open={open} onClose={close} title="Gerenciar categorias">
      {!creating ? (
        <Button
          variant="secondary"
          size="sm"
          className="mb-3 w-full"
          onClick={() => {
            setCreating(true);
            setEditingId(null);
            setConfirmId(null);
          }}
        >
          <Plus size={15} aria-hidden /> Nova categoria
        </Button>
      ) : (
        <div className="mb-3">
          <CategoryForm
            initial={{ name: "", color: COLOR_PRESETS[0] ?? "#0891b2", icon: "user" }}
            submitLabel="Criar"
            onSubmit={(d) => {
              addCategory(d);
              setCreating(false);
            }}
            onCancel={() => setCreating(false)}
          />
        </div>
      )}

      {categories.length === 0 && !creating ? (
        <p className="py-4 text-center text-sm text-text-muted">
          Nenhuma categoria ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {categories.map((c: Category) => {
            const count = countFor(c.id);
            if (editingId === c.id) {
              return (
                <li key={c.id}>
                  <CategoryForm
                    initial={{
                      name: c.name,
                      color: c.color,
                      icon: (c.icon ?? "user") as CategoryIconName,
                    }}
                    submitLabel="Salvar"
                    onSubmit={(d) => {
                      updateCategory(c.id, d);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                </li>
              );
            }
            return (
              <li
                key={c.id}
                className="flex items-center gap-2.5 rounded-lg border border-border p-2.5"
              >
                <span
                  aria-hidden
                  className="flex size-8 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: c.color }}
                >
                  <CategoryIcon name={c.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-text">
                    {c.name}
                  </span>
                  <span className="block text-xs text-text-muted">
                    {count === 0
                      ? "sem tarefas"
                      : count === 1
                        ? "1 tarefa"
                        : `${count} tarefas`}
                  </span>
                </span>
                {confirmId === c.id ? (
                  <span className="flex items-center gap-1.5">
                    <span className="max-w-36 text-right text-[11px] text-text-muted">
                      {count > 0
                        ? `${count} tarefa(s) ficarão sem categoria. Excluir?`
                        : "Excluir categoria?"}
                    </span>
                    <Button
                      variant="danger"
                      size="sm"
                      data-autofocus
                      onClick={() => {
                        deleteCategory(c.id);
                        setConfirmId(null);
                      }}
                    >
                      Sim
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmId(null)}
                    >
                      Não
                    </Button>
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5">
                    <button
                      type="button"
                      aria-label={`Editar ${c.name}`}
                      onClick={() => {
                        setEditingId(c.id);
                        setConfirmId(null);
                      }}
                      className="cursor-pointer rounded-md p-2 text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
                    >
                      <Pencil size={15} aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label={`Excluir ${c.name}`}
                      onClick={() => {
                        setConfirmId(c.id);
                        setEditingId(null);
                      }}
                      className="cursor-pointer rounded-md p-2 text-text-muted transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                    >
                      <Trash2 size={15} aria-hidden />
                    </button>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
