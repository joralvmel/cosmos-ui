---
name: add-theme
description: 'Adds a theme with defineTheme (seeds, harmony, light/dark), validates contrast and color vision deficiencies, and shows it in the docs gallery and in React Native.'
---

# add-theme

Main agent: `design-system`. Read `AGENTS.md` first.

## Inputs

- Theme name (not light/dark/system)
- Primary seed (OKLCH), optional accent, harmony, radius preset
- Optional: a palette to copy from another project (light and dark colors)

## Steps

To copy another project's palette, follow `use-reference` (palette mode): use its brand colors as
seeds and set the copied values per role with `modes.light` / `modes.dark` overrides; when one
fails validation, explain it and propose the nearest passing value. Follow the
[component workflow](../../../docs/conventions/component-workflow.md) for design approval and
local review. Do not edit the source project or promise exact reproduction at the cost of contrast.

1. Run `npm run generate -- theme <name> --seed "oklch(L C H)"`.
2. Tune seeds, harmony, neutral tint and radius; add mode overrides only when unavoidable.
3. Run the tokens tests: WCAG AA and CVD checks must pass for light and dark.
4. Build tokens and tailwind; check the gallery in the docs and the native demo theme switcher.
5. Document the theme intent in the definition comment.
6. Update relevant EN/ES docs and AI references, add the changeset and run `finish-work` for a local
   review commit. Stop without push or PR until that HEAD is accepted.

## Files

- `packages/tokens/src/themes.ts`
- `.changeset/add-<name>-theme.md`

## Checklist

- [ ] Validation passes
- [ ] Visible in docs gallery
- [ ] Available in native via `CosmosThemeProvider`

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
