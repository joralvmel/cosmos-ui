---
name: create-component
description: 'Creates a new Cosmos component end-to-end following docs/conventions/component-anatomy.md: contract and scenarios, Lit Web Component, React and Angular wrappers, React Native component and demo, tests, docs pages (EN/ES), llms.md and changeset.'
---

# create-component

Main agent: `component-builder`. Read `AGENTS.md` first.

## Inputs

- Component name (kebab-case, without `cosm-`)
- Purpose, props, events, slots, accessibility needs

## Steps

1. Run `component-status` for the component: it must be in the catalog and its `dependsOn` must be stable (otherwise build the dependencies first or use native primitives and record a catalog note).
2. Start a branch with `start-work` (`feat/<package>-<name>`). Ask `researcher` for references when the behavior is new (`research-reference`).
3. Write the API plan and the contract with `define-contract` (props, events and ownership, slots, parts, keyboard, ARIA).
4. Run `npm run generate -- component <name>` (`--dry-run` first to preview). It creates every file of the anatomy, the catalog entry if missing, `llms.md` sections and a changeset.
5. Implement the Web Component with core headless helpers, keeping the section order of the anatomy; apply the visual spec (`design-component`).
6. Complete the React events map and the Angular inputs/outputs from the contract.
7. Implement the native component and its demo screen (`create-native-component` steps 3-6).
8. Write tests on every platform: shared scenarios, drift tests and platform specifics (`add-contract-tests`).
9. Write the docs pages (EN + ES) in the anatomy order and update `llms.md` (`add-docs-page`, `add-playground`).
10. Edit the generated changeset and remove every `TODO(generator)` marker (`npm run status` keeps the component "in progress" while markers remain).
11. Finish with the structure test and the full validation: `npx vitest run test/structure.test.mjs` in `tools/`, then `npx biome ci . && npx turbo run typecheck test build`. When `npm run status` shows every piece, set `status: 'stable'` in the catalog entry.

## Files

- See docs/conventions/component-anatomy.md (contract, scenarios, Web Component, React, Angular, React Native, demo, tests, docs, llms.md, changeset)
- `packages/core/src/catalog.ts`

## Checklist

- [ ] Dependencies stable (or noted in the catalog)
- [ ] No `TODO(generator)` left
- [ ] Structure test green
- [ ] Drift tests green on 4 platforms
- [ ] Docs EN + ES
- [ ] Changeset

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
