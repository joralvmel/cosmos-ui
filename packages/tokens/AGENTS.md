# AGENTS.md — @joralvmel/cosmos-tokens

Read the root [AGENTS.md](../../AGENTS.md) first.

- `src/` is the source of truth; `scripts/build.mjs` writes `dist/tokens.css`, `dist/tailwind-theme.css`, `dist/tokens.json` and `dist/native.js`.
- The build fails if a built-in theme fails `validateTheme`. Fix seeds or generation, never thresholds.
- `src/runtime.ts` must not import the color engine (`culori`).
- `defineTheme` must keep rejecting unknown tokens, prototype keys and reserved names (`light`, `dark`, `system`).

Validate with `npx turbo run typecheck test build --filter=...@joralvmel/cosmos-tokens`.
