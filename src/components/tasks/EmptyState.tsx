import { ClipboardList, SearchX } from "lucide-react";
import { useTaskStore } from "@/store";
import { Button } from "../ui";

export function EmptyState({ filtered }: { filtered: boolean }) {
  const clearFilters = useTaskStore((s) => s.clearFilters);

  if (!filtered) {
    return (
      <div className="flex flex-col items-center rounded-lg border border-dashed border-border px-6 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-surface-2 text-text-muted">
          <ClipboardList size={22} aria-hidden />
        </span>
        <p className="mt-4 text-sm font-medium text-text">Nenhuma tarefa ainda</p>
        <p className="mt-1 max-w-60 text-[13px] text-text-muted">
          Crie a primeira acima — ou pressione <kbd className="rounded border border-border bg-surface-2 px-1 font-mono text-[11px]">N</kbd> em qualquer lugar.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-border px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-2 text-text-muted">
        <SearchX size={22} aria-hidden />
      </span>
      <p className="mt-4 text-sm font-medium text-text">Nada por aqui</p>
      <p className="mt-1 max-w-60 text-[13px] text-text-muted">
        Nenhuma tarefa corresponde aos filtros atuais.
      </p>
      <Button variant="secondary" size="sm" className="mt-4" onClick={clearFilters}>
        Limpar filtros
      </Button>
    </div>
  );
}
