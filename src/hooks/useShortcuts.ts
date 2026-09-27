import { useEffect } from "react";
import { useTaskStore } from "@/store";

/**
 * Global shortcuts (Passo 3):
 * - `N` → focus new-task title · `/` → focus search · `Esc` → close detail.
 * Typing targets are ignored (except `Esc`, which also blurs).
 */
export function useShortcuts() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      const typing =
        el !== null &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          el.isContentEditable);

      if (e.key === "Escape") {
        useTaskStore.getState().closeDetail();
        if (typing) el?.blur();
        return;
      }
      if (typing) return;

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        document.getElementById("new-task-title")?.focus();
      } else if (e.key === "/") {
        e.preventDefault();
        document.getElementById("global-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
