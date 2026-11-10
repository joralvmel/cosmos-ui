---
name: add-theme
description: 'Adds a theme with defineTheme (seeds, harmony, light/dark), validates contrast and color vision deficiencies, and shows it in the docs gallery and in React Native.'
---

# add-theme

Main agent: `design-system`. Read `AGENTS.md` first.

## Inputs

- Theme name (not light/dark/system)
- Primary seed (OKLCH), optional accent, harmony, radius preset

## Steps

1. Run `npm run generate -- theme <name> --seed "oklch(L C H)"`.
2. Tune seeds, harmony, neutral tint and radius; add mode overrides only when unavoidable.
3. Run the tokens tests: WCAG AA and CVD checks must pass for light and dark.
4. Build tokens and tailwind; check the gallery in the docs and the native demo theme switcher.
5. Document the theme intent in the definition comment.

## Files

- `packages/tokens/src/themes.ts`
- `.changeset/add-<name>-theme.md`

## Checklist

- [ ] Validation passes
- [ ] Visible in docs gallery
- [ ] Available in native via `CosmosThemeProvider`

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
