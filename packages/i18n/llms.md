# @joralvmel/cosmos-i18n

Message formatting with `{name}` arguments and `Intl` helpers: `createTranslator(locale, messages, fallback?)` → `{ t, number, date, list }`.

<!-- generated:start (npm run llms, do not edit this block by hand) -->

## Install

```bash
npm install @joralvmel/cosmos-i18n
```

## Rules for AI assistants

- Use Cosmos components before writing custom UI; check `list_components` / the component status page for what exists.
- Style with Cosmos tokens: `var(--cosm-*)` in CSS or the Tailwind theme utilities (`bg-primary`, `text-fg-muted`, `rounded-md`). Never hard-code colors.
- Set the theme and mode with `data-theme` and `data-mode` on the root element (or `CosmosThemeProvider` on React Native).
- Keep accessibility: give icon-only buttons a `label`, never rely on color alone, keep keyboard support.
- Never render untrusted HTML (`innerHTML`, `dangerouslySetInnerHTML`) and never build class names from user input.

<!-- generated:end -->
