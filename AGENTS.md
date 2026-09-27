# AGENTS.md - Projeto Tarefas (React + Vite)

## Quick Commands
| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Vite + HMR) |
| `npm run build` | Typecheck (`tsc --noEmit`) + production build (`dist/`) |
| `npm run typecheck` | Typecheck only |
| `npm run lint` | Run ESLint on JS/JSX + TS/TSX |
| `npm test` / `test:watch` / `coverage` | Vitest run / watch / v8 coverage |
| `npm run preview` | Preview production build |

## Architecture
- **Framework**: React 18 + Vite 5 (ESM). New code in TypeScript (`strict`); legacy `.jsx` still present
- **Path alias**: `@/*` → `src/*` (vite + tsconfig)
- **Routing**: React Router v7 (`createBrowserRouter` in `main.jsx`)
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` plugin. Semantic tokens in `src/index.css` (`bg-surface`, `text-text`, `border-border`, `bg-primary-600`, `shadow-elevation-*`, `duration-fast/base`, `ease-out-expo`); dark mode via `.dark` class (`@custom-variant`)
- **State**: Zustand store (`src/store/`): `useTaskStore` (tasks, categories, filter, sort, UI) + pure selectors (`selectFilteredTasks`, `selectTaskStats`) + shallow hooks (`useFilteredTasks`, `useTaskStats`). Persisted to `fiz-store-v1` (data slices only), cross-tab sync via `storage` event, first-run seed migrates legacy `tasks` key
- **Theme**: `ThemeProvider` (`src/theme/`) with `light|dark|system`, `useTheme()` hook; persists `fiz-theme`, migrates/syncs legacy `darkMode` key; `useDarkMode` hook is deprecated, kept for compat
- **UI primitives**: `src/components/ui/` (`Button`, `Input`, `Card`, `Badge`+`priorityTone`, `IconButton`, `Spinner`) + `src/components/layout/Container.tsx` (`Container`, `Stack`) + `cn()` in `src/lib/cn.ts`
- **Domain types**: `src/types/index.ts` (`Task` with additive optional fields, `LegacyTask`, `Category`, `TaskFilter`)
- **Icons**: `lucide-react`
- **IDs**: `uuid` v4

## Key Files
```
src/
├── main.tsx           # Entry: ThemeProvider + router
├── App.tsx            # Home: AppShell + form + FilterBar + TaskList + TaskDetail sheet
├── components/
│   ├── layout/AppShell.tsx  # Sticky header + sidebar/drawer + footer + skip link
│   ├── layout/Sidebar.tsx   # Views, categories, progress
│   ├── layout/Container.tsx # Container + Stack
│   ├── tasks/AddTaskForm.tsx# Title/desc/category/priority/due + inline validation
│   ├── tasks/TaskList.tsx   # DndContext + groups + overlay + SortSelect
│   ├── tasks/TaskItem.tsx   # Memo sortable card (handle ⋮⋮) + hover actions
│   ├── tasks/TaskGroup.tsx  # Collapsible section + empty-group drop zone
│   ├── tasks/groups.ts      # `group:<id>` drop-target ids
│   ├── tasks/SortSelect.tsx # manual|created|priority|dueDate|alpha
│   ├── tasks/EmptyState.tsx # Empty vs filtered states
│   ├── detail/TaskDetail.tsx    # Sheet (Modal variant) + autosave fields + actions
│   ├── detail/SubtaskList.tsx   # Checklist + progress + inline rename
│   ├── detail/ActivityTimeline.tsx # Kind icons + relative time
│   ├── detail/useAutosave.ts    # Debounced inline editing (400ms)
│   ├── filters/FilterBar.tsx # Priority/due/tag filters + chips + save view
│   ├── categories/CategoryManager.tsx # CRUD modal (name/color/icon, 2-step delete)
│   ├── categories/CategoryIcon.tsx + categoryIcons.ts # 12 curated lucide icons
│   ├── tags/TagsInput.tsx    # Combobox w/ usage-ranked suggestions
│   ├── feedback/Toasts.tsx      # Bottom stack + undo-delete action
│   ├── feedback/ErrorBoundary.tsx # Render guard w/ recovery card
│   ├── ui/                  # Button, Input, Card, Badge, IconButton, Modal, Spinner
│   ├── SearchInput.tsx      # Global search (focus with `/`)
│   └── ThemeToggle.tsx
├── hooks/useShortcuts.ts # `N` new task, `/` search, `Esc` close/blur
├── lib/cn.ts + lib/dates.ts # Classes + pt-BR due-date helpers
├── store/               # Zustand: taskStore, selectors, hooks, migrate
├── theme/               # ThemeProvider + useTheme (light/dark/system)
└── index.css          # Tailwind v4 tokens + `animate-rise`/`animate-slide-in`
```

## Routes
- `/` → `App` (list + detail sheet via `detailId`)
- `/task` → redirects to `/` (legacy route retired in Passo 6)

## Data Flow
- Tasks stored in `fiz-store-v1` (`{state:{tasks, categories}, version}`); legacy `tasks` key used once as first-run seed
- `App` reads via `useFilteredTasks()`/`useTaskStore`; detail sheet opens via `openDetail(id)` (`detailId`, `Esc` closes)
- `TaskFilter` = `{query, status, priority, categoryId, tags[], due}` + `SortMode`; filtering/sorting in pure `store/selectors.ts` (`selectAllTags` powers autocomplete + tag chips)
- `SavedView` snapshots `{filter, sort}` in store (persisted); applied from sidebar

## Dark Mode
- Persisted in `localStorage["darkMode"]`
- Falls back to `prefers-color-scheme`
- Applies `.dark` class to `<html>` element
- Tailwind `dark:` variants work automatically

## ESLint Config
- Flat config (`eslint.config.js`) with `typescript-eslint` (JS recommended + TS recommended)
- Plugins: `react`, `react-hooks`, `react-refresh`
- `dist/` ignored
- JSX runtime rules enabled
- `react/jsx-no-target-blank` and `react/prop-types` disabled
- Keep components and hooks/constants in separate files (`react-refresh/only-export-components` is warning)

## Gotchas
- TypeScript pinned to v5 (`typescript@5.9`): `typescript-eslint` does not support TS 7 yet — do not upgrade without checking
- `tsconfig.json` has no `baseUrl` (removed in TS 7, avoided for forward-compat); `@/*` paths use `./src/*`
- No `tailwind.config.js` — Tailwind v4 uses `@import "tailwindcss"` + `@theme` in `src/index.css`
- `index.html` has inline anti-FOUC theme script — keep in sync with `ThemeProvider` storage keys (`fiz-theme`, legacy `darkMode`)
- Fonts (Inter + JetBrains Mono) loaded via Google Fonts link in `index.html`
- DnD is handle-only (`GripVertical`, `touch-none`) and active in `manual` sort only; dropping on a task adopts its category, dropping on a group zone (`group:<id>`) moves to end of group; no auto-scroll during drag yet
- Detail sheet is `Modal variant="sheet"`; inline title/desc use `useAutosave` (400ms debounce, empty title rejected)
- White text must sit on `primary-700+` (white on `primary-600` is 3.68:1, fails AA) — verified pairs via node script
- `deleteTask` snapshots for `undoDelete`; `useDeleteTask()` wires toast+undo; toasts/lastDeleted are UI-only (excluded from persist)
- `TaskDetail`/`CategoryManager` are `React.lazy` chunks; PWA via `vite-plugin-pwa` (icons in `public/icons/`, generated from `src/assets/icon.png` with PIL)
- Tests: Vitest 3 + RTL + jsdom (`src/**/*.test.*`, setup in `src/test/`); store/persist writes on every `set`, so `resetStore()` clears storage AFTER `setState`
- Node 18: build needs `NODE_OPTIONS=--experimental-global-webcrypto` (workbox `crypto`); Node 20+ builds without the flag
- UI text is Portuguese