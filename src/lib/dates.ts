/** Date helpers for due dates (stored as `YYYY-MM-DD` or ISO strings). */

export function toDateKey(value: string): string {
  return value.slice(0, 10);
}

export function todayKey(now = new Date()): string {
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${m}-${d}`;
}

/** Signed day difference: due - today (date parts only, local time). */
export function diffDays(dueDate: string, now = new Date()): number {
  const [y, m, d] = toDateKey(dueDate).split("-").map(Number);
  const due = new Date(y, (m ?? 1) - 1, d ?? 1);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

/** Short relative label in pt-BR: "hoje", "amanhã", "em 5 dias", "há 2 dias". */
export function formatRelativeDue(dueDate: string, now = new Date()): string {
  const diff = diffDays(dueDate, now);
  if (diff === 0) return "hoje";
  if (diff === 1) return "amanhã";
  if (diff === -1) return "ontem";
  if (diff > 1) return `em ${diff} dias`;
  return `há ${Math.abs(diff)} dias`;
}

/** Absolute label in pt-BR: "5 de out de 2026". */
export function formatAbsoluteDue(dueDate: string): string {
  const [y, m, d] = toDateKey(dueDate).split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Relative datetime label in pt-BR for activity timestamps. */
export function formatRelativeTime(iso: string, now = new Date()): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  if (Number.isNaN(diffMs) || diffMs < 0) return "agora mesmo";
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return `há ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ontem";
  if (days < 7) return `há ${days} dias`;
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
