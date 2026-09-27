import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { IconButton } from "./IconButton";
import { cn } from "@/lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  /** `dialog` = centered; `sheet` = right-anchored panel, full-screen on mobile. */
  variant?: "dialog" | "sheet";
}

/**
 * Accessible dialog: overlay/Esc close, focus trap, focus restore,
 * body scroll lock. Rendered via portal.
 */
export function Modal({ open, onClose, title, children, className, variant = "dialog" }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = [...panel.querySelectorAll<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      )].filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    const t = window.setTimeout(() => {
      const panel = panelRef.current;
      const target =
        panel?.querySelector<HTMLElement>("[data-autofocus]") ??
        panel?.querySelector<HTMLElement>("button, input, select, textarea");
      target?.focus();
    }, 0);

    return () => {
      document.removeEventListener("keydown", onKey, true);
      window.clearTimeout(t);
      document.body.style.overflow = "";
      prevFocus.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const sheet = variant === "sheet";

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex",
        sheet ? "justify-end" : "items-end justify-center sm:items-center sm:p-4",
      )}
    >
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative w-full overflow-y-auto border-border bg-surface shadow-elevation-3",
          sheet
            ? "animate-slide-in h-dvh border-y-0 border-l p-5 sm:max-w-md sm:p-6"
            : "animate-rise max-h-[85vh] rounded-t-xl border p-5 sm:max-w-md sm:rounded-xl",
          className,
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-text">{title}</h2>
          <IconButton label="Fechar diálogo" size="sm" onClick={onClose}>
            <X size={16} />
          </IconButton>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
