import { createContext, useContext, useState, type ReactNode } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTaskStore } from "@/store";
import { useTheme } from "@/theme";
import { Container } from "./Container";
import { Sidebar } from "./Sidebar";
import { SearchInput } from "../SearchInput";
import { Logo } from "../Logo";
import { IconButton, Button } from "../ui";

interface FilterDrawerContextValue {
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const FilterDrawerContext = createContext<FilterDrawerContextValue | null>(null);

export function FilterDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = {
    open,
    openDrawer: () => setOpen(true),
    closeDrawer: () => setOpen(false),
  };
  return (
    <FilterDrawerContext.Provider value={value}>{children}</FilterDrawerContext.Provider>
  );
}

export function useFilterDrawer() {
  const ctx = useContext(FilterDrawerContext);
  if (!ctx) throw new Error("useFilterDrawer must be used within FilterDrawerProvider");
  return ctx;
}

function Header() {
  const { resolved, toggle } = useTheme();
  const { openDrawer } = useFilterDrawer();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Container maxWidth="2xl" className="flex h-14 items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-3">
          <a href="/" className="flex shrink-0 items-center text-text" aria-label="FIZ — início">
            <Logo className="h-8 w-auto" />
          </a>
        </div>
        <div className="flex-1 max-w-md mx-auto w-full">
          <SearchInput />
        </div>
        <div className="flex items-center gap-2">
          <IconButton
            label={resolved === "dark" ? "Modo claro" : "Modo escuro"}
            onClick={toggle}
          >
            {resolved === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>
          <IconButton
            label="Abrir filtros"
            onClick={openDrawer}
            className="md:hidden"
          >
            <Menu size={18} />
          </IconButton>
        </div>
      </Container>
    </header>
  );
}

function FilterDrawer() {
  const { open, closeDrawer } = useFilterDrawer();
  const filter = useTaskStore((s) => s.filter);
  const setFilter = useTaskStore((s) => s.setFilter);
  const clearFilters = useTaskStore((s) => s.clearFilters);
  const categories = useTaskStore((s) => s.categories);
  const tasks = useTaskStore((s) => s.tasks);
  const savedViews = useTaskStore((s) => s.savedViews);
  const applySavedView = useTaskStore((s) => s.applySavedView);
  const deleteSavedView = useTaskStore((s) => s.deleteSavedView);
  const sort = useTaskStore((s) => s.sort);
  const setSort = useTaskStore((s) => s.setSort);

  const usedTags = tasks
    .flatMap((t) => t.tags ?? [])
    .filter((v, i, a) => a.indexOf(v) === i);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 md:hidden"
        onClick={closeDrawer}
        aria-hidden="true"
      />
      <aside
        className="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l border-border bg-background shadow-elevation-3 animate-slide-in"
        role="dialog"
        aria-label="Filtros"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            <h2 className="font-semibold text-text">Filtros</h2>
            <IconButton label="Fechar" onClick={closeDrawer} size="sm">
              <X size={18} />
            </IconButton>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-2">Status</label>
              <div className="flex gap-2">
                {["all", "pending", "completed"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFilter({ status: status as "all" | "pending" | "completed" })}
                    className={`flex-1 h-10 rounded-md border text-sm font-medium transition-colors ${
                      filter.status === status
                        ? "border-text bg-text text-background"
                        : "border-border bg-surface text-text hover:border-text"
                    }`}
                  >
                    {status === "all" ? "Todas" : status === "pending" ? "Pendentes" : "Concluídas"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-2">Prioridade</label>
              <div className="flex gap-2">
                {["all", "high", "medium", "low"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFilter({ priority: p as "all" | "high" | "medium" | "low" })}
                    className={`flex-1 h-10 rounded-md border text-sm font-medium transition-colors ${
                      filter.priority === p
                        ? "border-text bg-text text-background"
                        : "border-border bg-surface text-text hover:border-text"
                    }`}
                  >
                    {p === "all" ? "Todas" : p === "high" ? "Alta" : p === "medium" ? "Média" : "Baixa"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-2">Vencimento</label>
              <div className="flex flex-wrap gap-2">
                {["all", "overdue", "today", "week", "none"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setFilter({ due: d as "all" | "overdue" | "today" | "week" | "none" })}
                    className={`h-10 px-3 rounded-md border text-sm font-medium transition-colors ${
                      filter.due === d
                        ? "border-text bg-text text-background"
                        : "border-border bg-surface text-text hover:border-text"
                    }`}
                  >
                    {d === "all" ? "Qualquer" : d === "overdue" ? "Vencidas" : d === "today" ? "Hoje" : d === "week" ? "7 dias" : "Sem data"}
                  </button>
                ))}
              </div>
            </div>
            {categories.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-text-muted mb-2">Categoria</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFilter({ categoryId: "all" })}
                    className={`h-10 px-3 rounded-md border text-sm font-medium transition-colors ${
                      filter.categoryId === "all"
                        ? "border-text bg-text text-background"
                        : "border-border bg-surface text-text hover:border-text"
                    }`}
                  >
                    Todas
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setFilter({ categoryId: c.id })}
                      className={`h-10 px-3 rounded-md border text-sm font-medium transition-colors ${
                        filter.categoryId === c.id
                          ? "border-text bg-text text-background"
                          : "border-border bg-surface text-text hover:border-text"
                      }`}
                      style={{ borderColor: c.color }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {usedTags.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-text-muted mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {usedTags.map((tag) => {
                    const active = filter.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setFilter({
                          tags: active
                            ? filter.tags.filter((t) => t !== tag)
                            : [...filter.tags, tag]
                        })}
                        className={`h-10 px-3 rounded-full border text-sm font-mono transition-colors ${
                          active
                            ? "border-text bg-text text-background"
                            : "border-border bg-surface text-text-muted hover:border-text hover:text-text"
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {savedViews.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-text-muted mb-2">Vistas salvas</label>
                <div className="space-y-2">
                  {savedViews.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        applySavedView(v.id);
                        closeDrawer();
                      }}
                      className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text hover:border-text transition-colors"
                    >
                      <span className="truncate">{v.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSavedView(v.id);
                        }}
                        className="shrink-0 cursor-pointer rounded p-1 text-text-muted hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="pt-4 border-t border-border">
              <label className="block text-xs font-medium text-text-muted mb-2">Ordenação</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as "manual" | "created" | "priority" | "dueDate" | "alpha")}
                className="w-full h-10 rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-text"
              >
                <option value="manual">Manual (arraste)</option>
                <option value="created">Mais recentes</option>
                <option value="priority">Prioridade</option>
                <option value="dueDate">Vencimento</option>
                <option value="alpha">A–Z</option>
              </select>
            </div>
          </div>
          <div className="border-t border-border p-4">
            <Button variant="secondary" className="w-full" onClick={clearFilters}>
              Limpar todos os filtros
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <FilterDrawerProvider>
      <div className="flex min-h-screen flex-col bg-background text-text">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm"
        >
          Pular para o conteúdo
        </a>
        <Header />
        <main id="main" className="flex-1">
          <Container maxWidth="2xl" className="px-4 py-6 sm:py-8">
            <div className="flex items-start gap-6">
              <aside
                aria-label="Navegação de tarefas"
                className="sticky top-16 hidden h-[calc(100vh-5rem)] w-64 shrink-0 overflow-hidden rounded-lg border border-border bg-surface md:block"
              >
                <Sidebar />
              </aside>
              <div className="min-w-0 flex-1">{children}</div>
            </div>
          </Container>
        </main>
        <footer className="border-t border-border">
          <Container
            maxWidth="2xl"
            className="flex h-12 items-center justify-between px-4 text-xs text-text-muted"
          >
            <span>FIZ — tarefas locais e offline</span>
            <span aria-hidden className="font-mono">
              N nova · / busca · Esc fecha
            </span>
          </Container>
        </footer>
        <FilterDrawer />
      </div>
    </FilterDrawerProvider>
  );
}
