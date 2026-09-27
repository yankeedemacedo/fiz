import { useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { selectAllTags, useTaskStore } from "@/store";
import { cn } from "@/lib/cn";

interface TagsInputProps {
  id: string;
  value: string[];
  onChange: (tags: string[]) => void;
}

/**
 * Tag editor: Enter/`,` adds, Backspace clears, arrows pick suggestions.
 * Suggestions come from the most-used tags in the store.
 */
export function TagsInput({ id, value, onChange }: TagsInputProps) {
  const tasks = useTaskStore((s) => s.tasks);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const q = text.trim().toLowerCase();
    return selectAllTags(tasks)
      .map((t) => t.tag)
      .filter((tag) => !value.some((v) => v.toLowerCase() === tag.toLowerCase()))
      .filter((tag) => (q ? tag.toLowerCase().includes(q) : true))
      .slice(0, 6);
  }, [tasks, text, value]);

  const add = (raw: string) => {
    const tag = raw.trim().replace(/\s+/g, "-").slice(0, 24);
    setText("");
    setActive(-1);
    if (!tag) return;
    if (value.some((v) => v.toLowerCase() === tag.toLowerCase())) return;
    onChange([...value, tag]);
  };

  const remove = (tag: string) =>
    onChange(value.filter((v) => v !== tag));

  return (
    <div ref={boxRef} className="relative">
      <div
        className={cn(
          "flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 transition-colors duration-fast",
          "focus-within:border-primary-500 hover:border-text-muted",
        )}
        onClick={() => document.getElementById(id)?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-surface-2 py-0.5 pr-1 pl-2.5 font-mono text-[11px] text-text"
          >
            #{tag}
            <button
              type="button"
              aria-label={`Remover tag ${tag}`}
              onClick={(e) => {
                e.stopPropagation();
                remove(tag);
              }}
              className="cursor-pointer rounded-full p-0.5 text-text-muted transition-colors hover:text-red-500"
            >
              <X size={12} aria-hidden />
            </button>
          </span>
        ))}
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open && suggestions.length > 0}
          aria-controls={`${id}-suggestions`}
          aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
          aria-label="Tags (Enter para adicionar)"
          placeholder={value.length === 0 ? "Tags (opcional)" : ""}
          autoComplete="off"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Delay so suggestion clicks register before close.
            window.setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              if (active >= 0 && suggestions[active]) add(suggestions[active] as string);
              else add(text);
            } else if (e.key === "Backspace" && text === "" && value.length > 0) {
              remove(value[value.length - 1] as string);
            } else if (e.key === "ArrowDown" && suggestions.length > 0) {
              e.preventDefault();
              setActive((a) => (a + 1) % suggestions.length);
            } else if (e.key === "ArrowUp" && suggestions.length > 0) {
              e.preventDefault();
              setActive((a) => (a - 1 + suggestions.length) % suggestions.length);
            } else if (e.key === "Escape") {
              setText("");
              setOpen(false);
            }
          }}
          className="min-w-24 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
        />
      </div>
      {open && suggestions.length > 0 && (
        <ul
          id={`${id}-suggestions`}
          role="listbox"
          aria-label="Sugestões de tags"
          className="absolute right-0 left-0 z-30 mt-1 max-h-44 overflow-y-auto rounded-md border border-border bg-surface py-1 shadow-elevation-2"
        >
          {suggestions.map((tag, i) => (
            <li
              key={tag}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === active}
            >
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(tag);
                }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between px-3 py-1.5 font-mono text-xs",
                  i === active ? "bg-surface-2 text-text" : "text-text-muted",
                )}
              >
                #{tag}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
