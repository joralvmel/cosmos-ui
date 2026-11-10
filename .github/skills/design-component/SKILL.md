---
name: design-component
description: 'Writes the visual spec of a component: anatomy, sizes, variants, states, tokens used, responsive behavior and light/dark notes, then styles it with tokens only.'
---

# design-component

Main agent: `design-system`. Read `AGENTS.md` first.

## Inputs

- Component name
- Contract (props that affect visuals)

## Steps

1. List the anatomy (parts) and map each to the contract parts.
2. Define sizes (control heights `--cosm-control-*`, spacing `--cosm-space-*`, typography `--cosm-text-*`).
3. Define variants and tones with semantic colors (`primary`, `*-subtle`, `*-text`, `border-strong`…).
4. Define every state: hover, active, focus-visible, disabled, loading, invalid, selected.
5. Check light and dark in every built-in theme; ensure 3:1 for UI boundaries and 4.5:1 for text.
6. Implement in the component `static styles` with `var(--cosm-*, fallback)` and expose `--cosm-<name>-*` hooks.
7. Mirror the spec in the native component through `useTheme()`.

## Files

- `docs/design/<name>.md`
- `packages/elements/src/components/<name>/cosm-<name>.ts` (styles)
- `packages/native/src/components/<name>.tsx` (styles)

## Checklist

- [ ] Only tokens
- [ ] Reduced motion respected
- [ ] Focus ring visible
- [ ] Light/dark verified

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
