---
name: add-playground
description: 'Adds or extends an interactive playground for a component in the docs, driven by its contract.'
---

# add-playground

Main agent: `docs-writer`. Read `AGENTS.md` first.

## Inputs

- Component name

## Steps

1. Use `<Playground name="<name>" content="..." />`; controls are generated from the contract props.
2. If a prop needs a custom control (e.g. a list of options), extend `apps/docs/src/components/Playground.astro` generically, not per component.
3. Keep the code snippet built with `textContent` only.

## Files

- `apps/docs/src/components/Playground.astro`
- component docs pages

## Checklist

- [ ] Controls match the contract
- [ ] No `innerHTML`

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
