import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/theme";
import { IconButton } from "./ui";

export function ThemeToggle() {
  const { resolved, toggle } = useTheme();
  return (
    <IconButton
      label={resolved === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
      onClick={toggle}
    >
      {resolved === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </IconButton>
  );
}
