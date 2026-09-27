import { Search, X } from "lucide-react";
import { useTaskStore } from "@/store";
import { cn } from "@/lib/cn";

export function SearchInput({ className }: { className?: string }) {
  const query = useTaskStore((s) => s.filter.query);
  const setFilter = useTaskStore((s) => s.setFilter);

  return (
    <div className={cn("relative", className)}>
      <Search
        size={16}
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted"
      />
      <input
        id="global-search"
        type="search"
        role="searchbox"
        aria-label="Buscar tarefas"
        placeholder="Buscar tarefas…"
        autoComplete="off"
        value={query}
        onChange={(e) => setFilter({ query: e.target.value })}
        className="h-10 w-full rounded-md border border-border bg-surface pr-16 pl-9 text-sm text-text placeholder:text-text-muted transition-colors duration-fast ease-out-expo hover:border-text-muted focus:border-primary-500"
      />
      {query ? (
        <button
          type="button"
          aria-label="Limpar busca"
          onClick={() => setFilter({ query: "" })}
          className="absolute top-1/2 right-9 -translate-y-1/2 cursor-pointer rounded p-1 text-text-muted transition-colors hover:text-text"
        >
          <X size={14} />
        </button>
      ) : null}
      <kbd
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-text-muted sm:block"
      >
        /
      </kbd>
    </div>
  );
}
