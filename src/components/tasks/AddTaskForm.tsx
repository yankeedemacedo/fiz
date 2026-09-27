import { useState, type FormEvent } from "react";
import { Plus, MoreHorizontal } from "lucide-react";
import { useTaskStore } from "@/store";
import type { TaskPriority } from "@/types";
import { Button, Card, Input } from "../ui";
import { TagsInput } from "../tags/TagsInput";
import { cn } from "@/lib/cn";

const PRIORITIES: { id: TaskPriority; label: string }[] = [
  { id: "low", label: "Baixa" },
  { id: "medium", label: "Média" },
  { id: "high", label: "Alta" },
];

interface AddTaskFormProps {
  inline?: boolean;
}

export function AddTaskForm({ inline = false }: AddTaskFormProps) {
  const addTask = useTaskStore((s) => s.addTask);
  const categories = useTaskStore((s) => s.categories);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(!inline);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Dê um título para a tarefa.");
      document.getElementById("new-task-title")?.focus();
      return;
    }
    addTask({
      title: title.trim(),
      description: description.trim(),
      categoryId: categoryId || undefined,
      tags,
      priority,
      dueDate: dueDate || null,
    });
    setTitle("");
    setDescription("");
    setCategoryId("");
    setTags([]);
    setPriority("medium");
    setDueDate("");
    setError(null);
    setExpanded(false);
    document.getElementById("new-task-title")?.focus();
  };

  const field =
    "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text transition-colors duration-fast ease-out-expo hover:border-text-muted focus:border-primary-700";

  if (inline && !expanded) {
    return (
      <form onSubmit={submit} aria-label="Nova tarefa" className="w-full">
        <div className="flex items-center gap-2">
          <Input
            id="new-task-title"
            placeholder="Nova tarefa… (N)"
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (error) setError(null); }}
            onFocus={() => setExpanded(true)}
            className="flex-1"
          />
          <Button type="submit" size="sm" aria-label="Adicionar tarefa">
            <Plus size={16} aria-hidden />
          </Button>
        </div>
        {error && <p role="alert" className="mt-1.5 text-xs text-red-500">{error}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={submit} aria-label="Nova tarefa" className="w-full">
      <Card elevation={2} className={cn(expanded && "animate-rise")}>
        <div className="space-y-3">
          <div>
            <label htmlFor="new-task-title" className="sr-only">Título da tarefa</label>
            <Input
              id="new-task-title"
              placeholder="O que precisa ser feito? (N)"
              value={title}
              invalid={error !== null}
              aria-describedby={error ? "new-task-error" : undefined}
              onChange={(e) => { setTitle(e.target.value); if (error) setError(null); }}
            />
            {error && (
              <p id="new-task-error" role="alert" className="mt-1.5 text-xs text-red-500">{error}</p>
            )}
          </div>
          <div>
            <label htmlFor="new-task-description" className="sr-only">Descrição (opcional)</label>
            <Input
              id="new-task-description"
              placeholder="Descrição (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <TagsInput id="new-task-tags" value={tags} onChange={setTags} />
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="new-task-category">Categoria</label>
            <select
              id="new-task-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={cn(field, "sm:max-w-44")}
            >
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div role="group" aria-label="Prioridade" className="flex overflow-hidden rounded-md border border-border">
              {PRIORITIES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={priority === p.id}
                  onClick={() => setPriority(p.id)}
                  className={cn(
                    "h-10 flex-1 cursor-pointer px-3 text-xs font-medium whitespace-nowrap transition-colors duration-fast sm:flex-none",
                    priority === p.id
                      ? p.id === "high"
                        ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
                        : p.id === "medium"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                          : "bg-surface-2 text-text"
                      : "text-text-muted hover:bg-surface-2 hover:text-text",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <label className="sr-only" htmlFor="new-task-due">Vencimento</label>
            <input
              id="new-task-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={cn(field, "sm:max-w-40")}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              <Plus size={17} aria-hidden /> Adicionar tarefa
            </Button>
            <button
              type="button"
              onClick={() => { setExpanded(false); setTitle(""); setDescription(""); setCategoryId(""); setTags([]); setPriority("medium"); setDueDate(""); setError(null); }}
              className="h-10 px-4 rounded-md border border-border bg-surface text-text-muted hover:bg-surface-2 transition-colors"
              aria-label="Cancelar"
            >
              <MoreHorizontal size={18} aria-hidden />
            </button>
          </div>
        </div>
      </Card>
    </form>
  );
}
