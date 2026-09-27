import {
  CalendarDays,
  Check,
  Flag,
  Pencil,
  Plus,
  RotateCcw,
  Tag,
  Type,
  type LucideIcon,
} from "lucide-react";
import type { ActivityKind, Category, TaskActivity } from "@/types";
import { formatAbsoluteDue, formatRelativeTime } from "@/lib/dates";

const KIND_META: Record<ActivityKind, { label: string; icon: LucideIcon }> = {
  created: { label: "criada", icon: Plus },
  completed: { label: "concluída", icon: Check },
  reopened: { label: "reaberta", icon: RotateCcw },
  renamed: { label: "renomeada", icon: Type },
  moved: { label: "movida", icon: Tag },
  edited: { label: "editada", icon: Pencil },
  dueChanged: { label: "vencimento alterado", icon: CalendarDays },
  priorityChanged: { label: "prioridade alterada", icon: Flag },
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "baixa",
  medium: "média",
  high: "alta",
};

function describe(
  a: TaskActivity,
  categories: Category[],
): string | null {
  switch (a.kind) {
    case "renamed":
      return a.detail ? `para “${a.detail}”` : null;
    case "moved":
      if (a.detail === undefined) return "para sem categoria";
      return `para ${categories.find((c) => c.id === a.detail)?.name ?? "categoria"}`;
    case "priorityChanged":
      return a.detail ? `para ${PRIORITY_LABELS[a.detail] ?? a.detail}` : null;
    case "dueChanged":
      return a.detail ? `para ${formatAbsoluteDue(a.detail)}` : "removido";
    default:
      return null;
  }
}

export function ActivityTimeline({
  activity,
  categories,
  createdAt,
}: {
  activity: TaskActivity[] | undefined;
  categories: Category[];
  createdAt: string;
}) {
  const items = [...(activity ?? [])].reverse();

  return (
    <section aria-label="Histórico">
      <h3 className="mb-2 text-sm font-semibold text-text">Histórico</h3>
      {items.length === 0 ? (
        <p className="text-[13px] text-text-muted">
          Criada em{" "}
          {new Date(createdAt).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
          , antes do histórico detalhado.
        </p>
      ) : (
        <ol className="space-y-0.5">
          {items.map((a) => {
            const meta = KIND_META[a.kind];
            const Icon = meta.icon;
            const extra = describe(a, categories);
            return (
              <li key={a.id} className="flex items-start gap-2.5 py-1">
                <span
                  aria-hidden
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-text-muted"
                >
                  <Icon size={13} />
                </span>
                <p className="min-w-0 flex-1 text-[13px] text-text-muted">
                  Tarefa {meta.label}
                  {extra && <span className="text-text"> {extra}</span>}
                  <span
                    className="block text-xs opacity-80"
                    title={new Date(a.at).toLocaleString("pt-BR")}
                  >
                    {formatRelativeTime(a.at)}
                  </span>
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
