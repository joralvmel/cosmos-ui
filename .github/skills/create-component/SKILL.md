---
name: create-component
description: 'Creates a new Cosmos component end-to-end with the generator: contract and scenarios, Lit Web Component, React and Angular wrappers, React Native component, tests, docs pages (EN/ES) and changeset.'
---

# create-component

Main agent: `component-builder`. Read `AGENTS.md` first.

## Inputs

- Component name (kebab-case, without `cosm-`)
- Purpose, props, events, slots, accessibility needs

## Steps

1. Write the API plan (props, events and ownership, slots, parts, keyboard, ARIA). Ask `researcher` for references if needed.
2. Run `npm run generate -- component <name>` (use `--dry-run` first to preview).
3. Complete the contract and scenarios (`define-contract`).
4. Implement the Web Component; use core headless helpers; style with the visual spec (`design-component`).
5. Complete the React events map and Angular inputs/outputs from the contract.
6. Implement the native component (`create-native-component` steps) and its demo screen.
7. Write tests: scenarios + drift on every platform, plus platform specifics.
8. Write the docs pages (EN + ES) and update the package `llms.md`.
9. Edit the generated changeset summary and remove every `TODO(generator)` marker.

## Files

- `packages/core/src/specs/<name>*.ts`
- `packages/elements/src/components/<name>/`
- `packages/react/src/components/<name>.ts`
- `packages/angular/src/components/<name>.component.ts`
- `packages/native/src/components/<name>.tsx`
- `apps/docs/src/content/docs/{,es/}components/<name>.mdx`
- `apps/native-demo/app/<name>.tsx`
- `.changeset/add-<name>.md`

## Checklist

- [ ] No `TODO(generator)` left
- [ ] Drift tests green on 4 platforms
- [ ] Docs EN + ES
- [ ] Changeset

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
