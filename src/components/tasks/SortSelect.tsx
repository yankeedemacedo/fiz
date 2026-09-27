import { ArrowDownUp } from "lucide-react";
import { useTaskStore, type SortMode } from "@/store";

const OPTIONS: { id: SortMode; label: string }[] = [
  { id: "manual", label: "Manual (arraste)" },
  { id: "created", label: "Mais recentes" },
  { id: "priority", label: "Prioridade" },
  { id: "dueDate", label: "Vencimento" },
  { id: "alpha", label: "A–Z" },
];

export function SortSelect() {
  const sort = useTaskStore((s) => s.sort);
  const setSort = useTaskStore((s) => s.setSort);

  return (
    <label className="inline-flex items-center gap-1.5 text-xs text-text-muted">
      <ArrowDownUp size={13} aria-hidden />
      <span className="sr-only">Ordenar por</span>
      <select
        aria-label="Ordenar por"
        value={sort}
        onChange={(e) => setSort(e.target.value as SortMode)}
        className="h-8 cursor-pointer rounded-md border border-transparent bg-transparent pr-1 text-xs font-medium text-text-muted transition-colors hover:border-border hover:text-text"
      >
        {OPTIONS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
