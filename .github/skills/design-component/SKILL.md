---
name: design-component
description: 'Writes the visual spec of a component: anatomy, sizes, variants, states, tokens used, responsive behavior and light/dark notes, then styles it with tokens only.'
---

# design-component

Main agent: `design-system`. Read `AGENTS.md` first.

## Inputs

- Component name
- Research findings and proposed scope (or an already accepted contract)

## Steps

Follow the [component workflow](../../../docs/conventions/component-workflow.md). Before code or
contract edits, propose the visual/API decisions in the main conversation, explain recommended
alternatives and **STOP for explicit user scope/design approval**. A contract or screenshot alone
is not permission to assume missing states or customization. The steps below document and implement
the accepted design; for a new component, write the spec before generation and styling.

1. List the anatomy (parts) and map each to the contract parts.
2. Define sizes (control heights `--cosm-control-*`, spacing `--cosm-space-*`, typography `--cosm-text-*`).
3. Define variants and tones with semantic colors (`primary`, `*-subtle`, `*-text`, `border-strong`…).
4. Define every applicable accepted state: hover, active, focus-visible, disabled, loading, invalid,
   selected. Do not add irrelevant states just to complete the list.
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
- [ ] Accepted scope, exclusions, customization and acceptance scenarios recorded

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
