import { createContext } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export interface ThemeContextValue {
  theme: Theme;
  resolved: ResolvedTheme;
  /** Legacy-compatible alias (`isDark === resolved === "dark"`). */
  isDark: boolean;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
