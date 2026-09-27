# FIZ — Gerenciador de Tarefas

Task manager moderno, rápido e local-first: funciona offline (PWA) e persiste no navegador.
Acompanha uma API Express opcional (`api/`) para sincronizar dados — sem ela, o app usa `localStorage`.

![stack](https://img.shields.io/badge/react-18%20%2B%20vite-61dafb) ![ts](https://img.shields.io/badge/typescript-strict-3178c6) ![tests](https://img.shields.io/badge/tests-76%20passing-brightgreen)

## 🛠️ Tecnologias

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| UI | React + Vite | 18.3 · 5.4 |
| Linguagem | TypeScript (`strict`, `noUnusedLocals`) | 5.9 (pinada — `typescript-eslint` ainda não suporta TS 7) |
| Estilo | Tailwind CSS (v4, tokens em `src/index.css`) + fontes Inter / JetBrains Mono | 4.1 |
| Estado | Zustand + `persist` (`fiz-store-v1`) | 5.0 |
| Arrastar e soltar | `@dnd-kit/core` + `@dnd-kit/sortable` (só com alça, só no modo manual) | 6.3 / 10.0 |
| Rotas | React Router (`/` lista+sheet · `/task` redireciona para `/`) | 7.12 |
| Ícones | `lucide-react` | 0.562 |
| IDs | `uuid` v4 | 13 |
| Testes | Vitest + Testing Library + jsdom (cobertura v8) | 3.2 |
| PWA | `vite-plugin-pwa` (Workbox, ícones em `public/icons/`) | 1.3 |
| API opcional | Express + CORS (`api/server.ts`, proxy `/api` no dev) | 5.2 |

## ✨ Funcionalidades

- **CRUD completo** com título, descrição, categoria, tags, prioridade e vencimento
- **Arrastar e soltar** entre tarefas e entre grupos de categoria (com teclado)
- **Filtros combináveis**: busca com acento-insensível (`cafe` acha `café`), status, prioridade, categoria, tags, vencimento (vencidas · hoje · 7 dias · sem data)
- **Vistas salvas**: snapshots de filtro+ordenação na sidebar
- **Detalhe em sheet** com autosave (400ms), subtarefas com progresso e **histórico de atividade**
- **Desfazer exclusão** via toast · **dark mode** (claro/escuro/sistema) · **PWA instalável**
- **Atalhos**: `N` nova tarefa · `/` buscar · `Esc` fechar

## 🚀 Como rodar

Pré-requisitos: **Node 20+** recomendado (no Node 18 o build do service worker exige flag — ver abaixo) e npm.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build (dist/)
npm run preview    # serve o build
```

Com a API opcional (sincroniza tarefas/categorias, com fallback para `localStorage`):

```bash
npm run dev:api     # sobe a API em http://localhost:3001
npm run dev:full    # app + API juntos (proxy /api → :3001)
```

> **Node 18**: o build do service worker exige `NODE_OPTIONS=--experimental-global-webcrypto npm run build`.
> No Node 20+ o build funciona sem flag.

## 🧪 Passo a passo para testar

Roteiro manual (~5 min) cobrindo os fluxos principais. Entre parênteses, o resultado esperado.

1. **Criar tarefa** — digite um título no campo "Nova tarefa…", expanda (`Enter` ou clique) e preencha descrição, categoria, tags, prioridade e vencimento. Clique em "Adicionar tarefa". (A tarefa aparece na lista com `animate-rise`.)
2. **Concluir/reabrir** — clique no checkbox da tarefa. (Vira `line-through`; o contador da sidebar atualiza.)
3. **Buscar** — pressione `/` e digite `cafe` com uma tarefa "café" cadastrada. (A busca é acento-insensível e multi-palavra.)
4. **Filtrar** — na sidebar ou no drawer mobile (☰), combine status, prioridade, categoria, tags e vencimento. (O contador mostra "N tarefas (filtradas de M)"; "Limpar filtros" restaura.)
5. **Ordenar** — troque o `SortSelect` entre manual, recentes, prioridade, vencimento e A–Z. (A lista reordena; com filtro ativo, a ordem manual pausa e mostra o aviso.)
6. **Arrastar e soltar** — em ordenação manual e sem filtros, arraste pela alça `⋮⋮` (mouse ou teclado). Solte sobre outra tarefa para adotar a categoria dela, ou na zona "Soltar no fim do grupo". (A tarefa muda de posição/grupo.)
7. **Detalhe em sheet** — clique em `›` numa tarefa. Edite título/descrição (autosave 400ms mostra "Salvando…" → "Salvo"), adicione subtarefas (barra de progresso atualiza) e confira o histórico de atividade. (`Esc` fecha.)
8. **Excluir + desfazer** — clique na lixeira e depois em "Desfazer" no toast. (A tarefa volta na posição original.)
9. **Vistas salvas** — aplique um filtro, salve como vista e reaplique pela sidebar. (Filtro+ordenação restaurados.)
10. **Dark mode** — alterne sol/lua no header. (Classe `.dark` no `<html>`, sem flash — persiste `fiz-theme`.)
11. **Offline/PWA** — rode `npm run build && npm run preview`, abra o DevTools → Application e confirme o service worker; instale o app. (Funciona sem rede.)
12. **Testes automatizados** — `npm test` (76 testes: store, seletores, lib, UI crítica). (Tudo verde.)

## ✅ Qualidade

```bash
npm run typecheck  # tsc --noEmit (strict)
npm run lint       # eslint (JS + TS)
npm test           # vitest (76 testes)
npm run coverage   # relatório v8
```

Cobertura atual: **store 96% · lib 100% · ui 94% · geral 63%**
(o shell visual — `AppShell`, `Sidebar`, `TaskDetail` — é verificado via typecheck/lint/build, não via DOM).

## 🗂️ Arquitetura

```
src/
├── store/       # Zustand: taskStore (ações) · selectors (puros) · hooks · migrate
├── components/  # ui/ (primitivas) · tasks/ · detail/ · filters/ · categories/ · tags/ · feedback/ · layout/
├── theme/       # ThemeProvider (light/dark/system) + useTheme
├── lib/         # cn() · dates (pt-BR)
└── types/       # Task, Category, TaskFilter, SavedView, Activity
```

- **Uma fonte de verdade**: todo estado vive no `useTaskStore`, persistido em `fiz-store-v1`
  (`tasks`, `categories`, `filter`, `sort`, `savedViews`; toasts/último-excluído/UI efêmera ficam fora).
  Sync entre abas via evento `storage`. Com a API no ar, os dados também sincronizam (`loadFromAPI`/`saveToAPI` com debounce); sem ela, o `localStorage` é a fonte.
- **Seletores puros** (`selectors.ts`) não importam React — dá para testar sem DOM.
- **Chaves de storage**: `fiz-store-v1` (app) · `fiz-theme` + legado `darkMode` (tema) · `tasks`
  (legado, lido uma vez como seed de migração).

## ⌨️ Decisões (resumo)

| Tema | Decisão |
|------|---------|
| Estado | Zustand + persist (local-first; `api/` opcional sincroniza com debounce) |
| DnD | `@dnd-kit`, só com alça, só no modo manual; soltar adota categoria |
| A11y | Contraste AA verificado por script (branco exige `primary-700+`); diálogos com focus-trap; DnD por teclado; live regions |
| TypeScript | Pinado em v5 — `typescript-eslint` ainda não suporta TS 7 |
| Sem Storybook | Primitivas são poucas e cobertas por testes; docs vivem aqui |
| Sem i18n | UI em pt-BR por decisão; strings estão nos componentes, não centralizadas |

Veja [`CONTRIBUTING.md`](./CONTRIBUTING.md) para convenções de código, testes e tokens de design.
