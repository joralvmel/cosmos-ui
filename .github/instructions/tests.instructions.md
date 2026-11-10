---
applyTo: '**/test/**'
---

# Tests (Vitest 5)

- Follow [`docs/conventions/component-anatomy.md`](../../docs/conventions/component-anatomy.md): exact file names and section order. `tools/test/structure.test.mjs` checks every implemented component.
- Tests live in each package's `test/` folder as `*.test.ts(x)` (`*.test.mjs` in `tools`). Run them with
  `npx turbo run test --filter=@joralvmel/cosmos-<pkg>...` or `npx vitest run` inside the package.
- DOM packages use `happy-dom`; pure packages use `node`.
- Every component has three kinds of tests on each platform:
  1. **Shared scenarios** from `packages/core/src/specs/<name>.scenarios.ts` through a small driver.
  2. **Drift test** against `propNames()` / `eventNames()` of the contract.
  3. Platform specifics (forms, focus, rendering of parts, theme usage).
- Test public behavior (properties, attributes, events, slots, parts, accessibility attributes), not
  private fields or full shadow DOM snapshots.
- Lit: `fixture()` helper and `await el.updateComplete`; clean up in `afterEach`.
- happy-dom does not activate buttons from keys: drivers dispatch the `keydown` and then the `click`
  a browser would produce. Real keyboard behavior is covered by Playwright (planned).
- Keep tests deterministic: no timers without fake timers, no network.
