# Contributing — FIZ

## Setup

```bash
npm install
npm run dev
```

Node 18 funciona, mas o `react-router` pede Node ≥ 20 (warnings no install são esperados;
use `--legacy-peer-deps` se o npm reclamar — já é o padrão adotado aqui).

## Antes de abrir PR

```bash
npm run typecheck && npm run lint && npm test
```

O build (`npm run build`) roda o typecheck junto — se passar local, passa no CI.

## Convenções

- **Commits**: Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`).
- **Componentes**: um componente por arquivo; hooks/constantes em arquivos próprios
  (o lint `react-refresh/only-export-components` é warning — mantenha em zero).
- **Acesso ao store**: componentes usam seletores (`useTaskStore(s => s.x)`) ou os hooks
  `useFilteredTasks`/`useTaskStats` (com `useShallow`). Nunca leiam `localStorage` direto.
- **Lógica pura em `store/selectors.ts` e `lib/`**: sem imports de React, para testar sem DOM.
- **Acessibilidade é requisito**: todo botão-ícone tem `aria-label`, diálogos usam `Modal`,
  regiões dinâmicas usam `aria-live`, e texto branco só sobre `primary-700` ou mais escuro
  (branco sobre `primary-600` = 3.68:1, **falha** no AA).
- **Tokens, não hex solto**: cores/espaços/raios vêm de `src/index.css`
  (`bg-surface`, `text-text-muted`, `shadow-elevation-*`, `duration-fast`, …).
- **Ícones**: `lucide-react`, tamanho base 16–18px.
- **Testes**: nova lógica de store/seletor entra com teste em Vitest no mesmo diretório
  (`*.test.ts`). Fluxos de UI críticos (criar→concluir→excluir→desfazer) têm teste em RTL.
  Harness descartáveis vão em `/tmp/opencode/`, nunca no repo.

## Design tokens (resumo)

`src/index.css` define a escala via `@theme`: `primary` (cyan), superfícies semânticas
(`background/surface/surface-2/border/text/text-muted` com variantes `.dark`),
`shadow-elevation-1–3`, `duration-fast/base/slow` + `ease-out-expo`,
`animate-rise`/`animate-slide-in`. Dark mode = classe `.dark` no `<html>`.

## PWA

Ícones em `public/icons/` (gerados de `src/assets/icon.png`):

```bash
python3 -c "
from PIL import Image
img = Image.open('src/assets/icon.png').convert('RGBA')
for s in (192, 512): img.resize((s, s), Image.LANCZOS).save(f'public/icons/icon-{s}.png')"
```

## Atalhos globais (`useShortcuts`)

`N` foca o título da nova tarefa · `/` foca a busca · `Esc` fecha detalhe/diálogo.
Não disparam com modificadores nem dentro de campos (exceto `Esc`).
