---
applyTo: 'packages/angular/**'
---

# Angular wrappers (Angular 22)

- Follow [`docs/conventions/component-anatomy.md`](../../docs/conventions/component-anatomy.md): exact file names and section order. `tools/test/structure.test.mjs` checks every implemented component.
- One standalone component per element in `src/components/<name>.component.ts`, with the same
  selector as the custom element (`cosm-<name>`), `template: '<ng-content />'` and `OnPush`.
- Inputs use `@Input()` setters that write to the element (`booleanAttribute` for booleans). Signal
  `input()`/`output()` are not used because tests compile in JIT mode.
- Outputs use `@Output()` + `EventEmitter<CustomEvent<Detail>>` re-emitted from a `host` listener on
  the DOM event. Names follow the contract (`press`, `valueChange`, `openChange`).
- Form controls provide a `ControlValueAccessor`; do not promise primitive `[(value)]` bindings.
- Add the component to `COSMOS_COMPONENTS` in `src/index.ts`.
- Build with `ngc` (partial compilation); `tsconfig*.json` keep `experimentalDecorators` and
  `useDefineForClassFields: false`.
- Tests use `TestBed` (setup in `test/setup.ts`) and the drift test reads `ɵcmp.inputs/outputs`.
