---
applyTo: 'packages/react/**'
---

# React wrappers (React 19)

- Follow [`docs/conventions/component-anatomy.md`](../../docs/conventions/component-anatomy.md): exact file names and section order. `tools/test/structure.test.mjs` checks every implemented component.
- One file per component in `src/components/<name>.ts`, created with `@lit/react` `createComponent`.
- Export an events map (`<name>Events`) whose keys are the contract React names (`onPress`,
  `onChange`, `onOpenChange`) and values the DOM events typed with `EventName<CustomEvent<Detail>>`.
- Handlers receive the original `CustomEvent`. No prefixed aliases (`onCosmPress`).
- Wrappers never re-implement behavior or styles; controlled mode is detected from bound props
  ([ADR 0003](../../docs/adr/0003-state-ownership-and-events.md)).
- Export `<Name>` and `<Name>Props` from `src/index.ts`.
- Tests (`test/<name>.test.tsx`) render with `react-dom/client` + `act` in happy-dom, run the shared
  scenarios and the drift test. Vitest resolves the `browser` export conditions (see `vitest.config.ts`).
