import { useEffect } from "react";
import { X } from "lucide-react";
import { useTaskStore } from "@/store";
import type { Toast } from "@/store/taskStore";

const DURATION_MS = 5000;

function ToastItem({ toast }: { toast: Toast }) {
  const dismissToast = useTaskStore((s) => s.dismissToast);

  useEffect(() => {
    const t = window.setTimeout(() => dismissToast(toast.id), DURATION_MS);
    return () => window.clearTimeout(t);
  }, [toast.id, dismissToast]);

  return (
    <div
      role="status"
      className="animate-rise pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-surface py-2.5 pr-2 pl-3.5 shadow-elevation-3"
    >
      <p className="min-w-0 flex-1 truncate text-sm text-text">{toast.message}</p>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick();
            dismissToast(toast.id);
          }}
          className="shrink-0 cursor-pointer rounded-md bg-primary-700 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-primary-800"
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        aria-label="Dispensar notificação"
        onClick={() => dismissToast(toast.id)}
        className="shrink-0 cursor-pointer rounded p-1.5 text-text-muted transition-colors hover:text-text"
      >
        <X size={14} aria-hidden />
      </button>
    </div>
  );
}

/**
 * Bottom toast stack. `aria-live` announces messages;
 * actions (e.g. undo delete) render as buttons.
 */
export function Toasts() {
  const toasts = useTaskStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
