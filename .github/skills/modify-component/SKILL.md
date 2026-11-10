---
name: modify-component
description: 'Changes the API or behavior of an existing component while keeping parity and the anatomy: contract → Lit → wrappers → React Native → scenarios → docs → llms.md → changeset.'
---

# modify-component

Main agent: `component-builder`. Read `AGENTS.md` first.

## Inputs

- Component name
- Change requested

## Steps

1. Run `component-status` for the component and for any component it will use; start a branch with `start-work`.
2. Update the contract and scenarios first; decide the semver impact with `architect`.
3. Update the Web Component (respecting the section order of the anatomy), then React events/props, Angular inputs/outputs and the native component.
4. Update or add tests on every platform; drift tests must pass without exceptions.
5. Update docs pages (EN + ES), the Playground if new props need controls, and `llms.md`.
6. Add a changeset for every touched package (`major` with migration notes when breaking).
7. Finish with the structure test (`tools/test/structure.test.mjs`) and `npx biome ci . && npx turbo run typecheck test build`.

## Files

- Contract, implementations, tests and docs of the component (anatomy paths)

## Checklist

- [ ] Parity on every platform
- [ ] Structure test green
- [ ] Breaking changes documented
- [ ] Changeset

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
