---
name: add-token
description: 'Adds a token to every output (CSS variables, Tailwind theme, React Native values, JSON) with tests.'
---

# add-token

Main agent: `design-system`. Read `AGENTS.md` first.

## Inputs

- Token name and purpose
- Value per theme/mode or rule to derive it

## Steps

1. Semantic colors: add the name to `semanticColors` in `packages/tokens/src/types.ts` and derive it in `generate.ts`; add contrast pairs in `validate.ts` when it carries text or UI.
2. Base tokens: add it to `packages/tokens/src/base.ts` and map it in `toTailwindTheme`/`toNative` if needed.
3. Update tests in `packages/tokens/test` and the Tailwind compile test.
4. Document the token in `packages/tokens/llms.md`.

## Files

- `packages/tokens/src/*`
- `packages/tokens/test/*`
- `packages/tailwind/test/*`

## Checklist

- [ ] All outputs contain the token
- [ ] Validation green
- [ ] Changeset (minor)

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
