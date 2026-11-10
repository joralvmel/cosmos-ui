---
name: sync-icons
description: 'Updates the Lucide version, regenerates the icon definitions and catalog, and refreshes the license notice.'
---

# sync-icons

Main agent: `component-builder`. Read `AGENTS.md` first.

## Inputs

- Target Lucide version

## Steps

1. Update the Lucide dependency of `packages/icons`.
2. Run the icons build script to regenerate per-icon modules and the catalog.
3. Copy the Lucide license to the package and update its row in `THIRD_PARTY_NOTICES.md`.
4. Check for removed or renamed icons and add a changeset (`major` if icons were removed).

## Files

- `packages/icons/**`
- `THIRD_PARTY_NOTICES.md`

## Checklist

- [ ] License shipped
- [ ] Catalog regenerated
- [ ] Breaking renames documented

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
