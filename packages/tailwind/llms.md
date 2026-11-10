# @joralvmel/cosmos-tailwind

Tailwind CSS v4 theme of Cosmos UI: utilities mapped to Cosmos tokens (`bg-primary`, `text-fg-muted`, `rounded-md`…), `dark:` and `theme-<name>:` variants. Default Tailwind colors are disabled.

<!-- generated:start (npm run llms, do not edit this block by hand) -->

## Setup: Tailwind CSS v4

```bash
npm install @joralvmel/cosmos-tailwind && npm install -D tailwindcss @tailwindcss/vite
```

**Import the Cosmos theme after Tailwind** (`src/styles.css`)

```css
@import "tailwindcss";
@import "@joralvmel/cosmos-tailwind";
```

**Use token utilities**

```html
<div class="bg-surface text-fg rounded-lg shadow-md p-4 dark:bg-surface-raised">
  <p class="text-fg-muted">Uses Cosmos tokens in every theme and mode.</p>
</div>
```

- Default Tailwind colors are disabled: use semantic colors (`bg-primary`, `text-danger-text`…).
- `dark:` follows `data-mode` (including `system`); `theme-<name>:` targets one theme.

Guide: https://joralvmel.github.io/cosmos-ui/guides/tailwind/

## Themes

Built-in themes: `cosmos`, `nebula` (default `cosmos`), each with `light` and `dark` modes; `system` follows the OS.

```html
<html data-theme="nebula" data-mode="system">
<!-- runtime: setTheme(name), setMode(mode) from @joralvmel/cosmos-tokens/runtime -->
```

Custom themes: `defineTheme()` in `@joralvmel/cosmos-tokens` (https://joralvmel.github.io/cosmos-ui/theming/themes/).

## Rules for AI assistants

- Use Cosmos components before writing custom UI; check `list_components` / the component status page for what exists.
- Style with Cosmos tokens: `var(--cosm-*)` in CSS or the Tailwind theme utilities (`bg-primary`, `text-fg-muted`, `rounded-md`). Never hard-code colors.
- Set the theme and mode with `data-theme` and `data-mode` on the root element (or `CosmosThemeProvider` on React Native).
- Keep accessibility: give icon-only buttons a `label`, never rely on color alone, keep keyboard support.
- Never render untrusted HTML (`innerHTML`, `dangerouslySetInnerHTML`) and never build class names from user input.
- Only use the Cosmos Tailwind theme utilities; default Tailwind colors are disabled.

<!-- generated:end -->
