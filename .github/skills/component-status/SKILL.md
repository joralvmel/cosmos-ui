---
name: component-status
description: 'Reports the component inventory (npm run status), explains gaps and proposes or creates the next components according to their dependencies. Run it before creating, modifying or composing components.'
---

# component-status

Main agent: `architect`. Read `AGENTS.md` first.

## Inputs

- Component to check, or "all"

## Steps

1. Run `npm run status` (or `npm run status -- --json` to process the output). It compares `packages/core/src/catalog.ts` with the files in the repository.
2. Report: summary, the requested component with its missing pieces, `blockedBy` dependencies and the `next` suggestions (planned or in-progress components whose dependencies are stable).
3. If the component is not in the catalog, add an entry first (name, title, category, batch, priority, `dependsOn`, APG/HTML `pattern`, `platforms`, `target`) and ask `architect` to confirm it.
4. If its dependencies are not stable, propose building them first (in `buildOrder()` order) or, when the user agrees, start the work with `create-component` for the first unblocked dependency.
5. Composition rule: before using a component inside another, look it up here. If it is stable, use it. If not, use the accessible native primitive (`<button>`, `<input>`, `<select>`, `<dialog>`, `popover` attribute…), add the dependency to `dependsOn` and write a traceable note in the catalog entry `notes` (e.g. "uses native <select> until listbox is stable"). Never leave TODOs in component code.
6. When `npm run status` shows every piece for a component, set `status: 'stable'` in its catalog entry (the status test checks the claim).

## Files

- `packages/core/src/catalog.ts`
- `tools/status/component-status.mjs` (read only)

## Checklist

- [ ] Status report shared
- [ ] Catalog updated (entries, dependencies, notes)
- [ ] Next component proposed or started

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
