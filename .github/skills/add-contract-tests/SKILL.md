---
name: add-contract-tests
description: 'Adds shared behavior scenarios to a contract and runs them on the web, React, Angular and React Native through drivers.'
---

# add-contract-tests

Main agent: `test-engineer`. Read `AGENTS.md` first.

## Inputs

- Component name
- Behavior to cover

## Steps

1. Add scenarios to `packages/core/src/specs/<name>.scenarios.ts` (props, actions, expected events and state; `platforms` filter when needed).
2. Update each platform driver to support any new action type (pointer, keyboard, touch, focus).
3. Run the tests of core, elements, react, angular and native.
4. Follow the [component workflow](../../../docs/conventions/component-workflow.md) evidence matrix:
   exercise the real web component and React/Angular wrappers in a browser, plus the native demo
   on React Native Web and available native runtimes. Separate mocks/exports from actual interaction.
   Record exact scenarios, environments and unavailable checks; do not ask the user to run tests
   the agents can perform with available tools.

## Files

- `packages/core/src/specs/<name>.scenarios.ts`
- `packages/*/test/<name>.test.ts(x)`

## Checklist

- [ ] Every platform runs the scenarios
- [ ] Controlled and autonomous cases covered

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
