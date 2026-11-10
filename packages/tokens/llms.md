# @joralvmel/cosmos-tokens

Design tokens and theme engine of Cosmos UI: OKLCH themes with light and dark modes, generated as CSS variables (`--cosm-*`), a Tailwind v4 theme, React Native values and JSON. Every theme is validated for WCAG 2.2 AA contrast and color vision deficiencies.

<!-- generated:start (npm run llms, do not edit this block by hand) -->

## Install

```bash
npm install @joralvmel/cosmos-tokens
```

## Themes

Built-in themes: `cosmos`, `nebula` (default `cosmos`), each with `light` and `dark` modes; `system` follows the OS.

```html
<html data-theme="nebula" data-mode="system">
<!-- runtime: setTheme(name), setMode(mode) from @joralvmel/cosmos-tokens/runtime -->
```

Custom themes: `defineTheme()` in `@joralvmel/cosmos-tokens` (https://joralvmel.github.io/cosmos-ui/theming/themes/).

## Tokens

Semantic colors (`--cosm-<name>`): bg, surface, surface-raised, fg, fg-muted, border, border-strong, primary (+ -hover, -fg, -subtle, -text), accent (same), success | warning | danger | info (+ -fg, -subtle, -text), focus-ring, overlay, chart-1..8.
Scales: `--cosm-<neutral|primary|accent|success|warning|danger|info>-<1..12>`.
Base: `--cosm-space-*`, `--cosm-text-*`, `--cosm-weight-*`, `--cosm-leading-*`, `--cosm-radius-*`, `--cosm-shadow-*`, `--cosm-control-*`, `--cosm-duration-*`, `--cosm-easing-*`, `--cosm-z-*`.
React Native: `getNativeTheme(name, mode)` from `@joralvmel/cosmos-tokens/native` (hex colors, sizes in points).

## Rules for AI assistants

- Use Cosmos components before writing custom UI; check `list_components` / the component status page for what exists.
- Style with Cosmos tokens: `var(--cosm-*)` in CSS or the Tailwind theme utilities (`bg-primary`, `text-fg-muted`, `rounded-md`). Never hard-code colors.
- Set the theme and mode with `data-theme` and `data-mode` on the root element (or `CosmosThemeProvider` on React Native).
- Keep accessibility: give icon-only buttons a `label`, never rely on color alone, keep keyboard support.
- Never render untrusted HTML (`innerHTML`, `dangerouslySetInnerHTML`) and never build class names from user input.

<!-- generated:end -->
