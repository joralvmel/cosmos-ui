---
name: define-contract
description: 'Creates or updates a component contract (props, events, states, slots, parts, keyboard, ARIA) and its shared scenarios in core, with the DOM/React/Angular/React Native mapping.'
---

# define-contract

Main agent: `architect`. Read `AGENTS.md` first.

## Inputs

- Component name (kebab-case)
- Behavior summary and reference pattern

## Steps

1. Open or create `packages/core/src/specs/<name>.ts` with `defineContract` (the generator creates it for new components).
2. Declare props with type, default, `reflect` (styling props) and `platforms` when not universal.
3. Declare events with `names: { dom, react, angular, native }` following ADR 0003 and a `<Name><Event>Detail` type.
4. Declare public `states` and their proposal events; mark cancelable requests.
5. Write slots, parts, CSS custom properties, ARIA role, APG pattern URL and keyboard map.
6. Write `<name>.scenarios.ts`: props + actions → expected events and state, with `platforms` when an action does not apply.
7. Register the contract in `contracts` in `packages/core/src/index.ts`.

## Files

- `packages/core/src/specs/<name>.ts`
- `packages/core/src/specs/<name>.scenarios.ts`
- `packages/core/src/index.ts`

## Checklist

- [ ] Enum defaults belong to their values
- [ ] Event names follow the naming table
- [ ] Scenarios cover autonomous and controlled usage
- [ ] Core tests green

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
