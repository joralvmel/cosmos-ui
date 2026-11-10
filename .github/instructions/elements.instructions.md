---
applyTo: 'packages/elements/**,packages/charts/**'
---

# Web Components (Lit 3)

- Follow [`docs/conventions/component-anatomy.md`](../../docs/conventions/component-anatomy.md): exact file names and section order. `tools/test/structure.test.mjs` checks every implemented component.
- One folder per component: `src/components/<name>/cosm-<name>.ts`, exported from `src/index.ts` and
  from a subpath in `package.json` (`./<name>`). The generator does this.
- Extend `CosmElement` (`src/internal/cosm-element.ts`) and dispatch events with `this.emit()`:
  `cosm-*` names, typed `detail` from core, `bubbles` and `composed`; cancelable for requests.
- Reactive properties: `static override properties = {...}` + `declare` fields, initialized in the
  constructor from the contract defaults. No decorators, no class-field initializers for reactive
  properties. Reflect only properties used for styling (as declared in the contract).
- Register with `define('cosm-<name>', Class)` and augment `HTMLElementTagNameMap` /
  `HTMLElementEventMap`.
- Behavior comes from core headless helpers when available (`getPressableState`…).
- Interactive elements: `shadowRootOptions` with `delegatesFocus: true`, native elements when
  possible, `:focus-visible` outline via `focusRing`, keyboard map from the contract.
- Form controls are form-associated (`static formAssociated = true`, `attachInternals()` with a
  fallback for test environments); keep form-disabled state separate from `disabled`.
- Styles: Lit `css` with `var(--cosm-*, fallback)` only; hooks `--cosm-<name>-*`; `::part` for every
  documented part; `@media (prefers-reduced-motion: reduce)`.
- JSDoc on the class: `@tag`, `@slot`, `@csspart`, `@fires`, `@cssprop` — the Custom Elements
  Manifest is generated from it.
- Never use `unsafeHTML` or `innerHTML`.
