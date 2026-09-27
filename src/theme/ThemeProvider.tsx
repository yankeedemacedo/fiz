import { useEffect, useState, type ReactNode } from "react";
import {
  ThemeContext,
  type ResolvedTheme,
  type Theme,
  type ThemeContextValue,
} from "./theme-context";

const STORAGE_KEY = "fiz-theme";
const LEGACY_KEY = "darkMode";
const CLASS = "dark";

function getSystem(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readStored(): Theme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy !== null) return JSON.parse(legacy) ? "dark" : "light";
  } catch {
    /* storage unavailable */
  }
  return "system";
}

function apply(resolved: ResolvedTheme) {
  const el = document.documentElement;
  el.classList.toggle(CLASS, resolved === "dark");
  el.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => readStored());
  const [system, setSystem] = useState<ResolvedTheme>(() => getSystem());

  const resolved: ResolvedTheme =
    theme === "system" ? system : (theme as ResolvedTheme);

  useEffect(() => {
    apply(resolved);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
      localStorage.setItem(LEGACY_KEY, JSON.stringify(resolved === "dark"));
    } catch {
      /* ignore */
    }
  }, [theme, resolved]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) =>
      setSystem(e.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const v = e.newValue as Theme;
        if (v === "light" || v === "dark" || v === "system") setThemeState(v);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      mq.removeEventListener("change", onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggle = () => {
    setThemeState((prev) => {
      const current: ResolvedTheme =
        prev === "system" ? getSystem() : (prev as ResolvedTheme);
      return current === "dark" ? "light" : "dark";
    });
  };

  const value: ThemeContextValue = { theme, resolved, isDark: resolved === "dark", setTheme, toggle };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
