---
name: modify-component
description: 'Changes the API or behavior of an existing component while keeping parity: contract → Lit → wrappers → React Native → scenarios → docs → llms.md → changeset.'
---

# modify-component

Main agent: `component-builder`. Read `AGENTS.md` first.

## Inputs

- Component name
- Change requested

## Steps

1. Update the contract and scenarios first; decide the semver impact with `architect`.
2. Update the Web Component, then React events/props, Angular inputs/outputs and the native component.
3. Update or add tests on every platform; drift tests must pass without exceptions.
4. Update docs pages (EN + ES), examples and `llms.md`.
5. Add a changeset for every touched package (`major` with migration notes when breaking).

## Files

- Contract, implementations, tests and docs of the component

## Checklist

- [ ] Parity on every platform
- [ ] Breaking changes documented
- [ ] Changeset

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
