# @joralvmel/cosmos-tailwind

Tailwind CSS v4 theme for [Cosmos UI](../../README.md).

Maps Tailwind utilities to Cosmos tokens and adds `dark:` and `theme-<name>:` variants.

```css
@import "tailwindcss";
@import "@joralvmel/cosmos-tailwind"; /* tokens + theme + variants */
/* or, if tokens.css is loaded separately: */
@import "@joralvmel/cosmos-tailwind/theme.css";
```

Default Tailwind colors are removed: use `bg-primary`, `text-fg-muted`, `border-border`,
`bg-danger-subtle`, `text-danger-text`… Radius, shadows, spacing (`p-4` = 4 × `--cosm-space-unit`),
typography and breakpoints also come from Cosmos. `dark:` follows `data-mode` (including `system`).

## License

MIT
