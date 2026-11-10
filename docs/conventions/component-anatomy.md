# Component anatomy

Every Cosmos component has the same files, with the same names and the same internal order on every
platform. The generator (`npm run generate -- component <name>`) produces exactly this structure and
`tools/test/structure.test.mjs` checks every implemented component of the catalog against it (the
checker lives in `tools/status/anatomy.mjs`).

Names below use `chip` as example: kebab `chip`, Pascal `Chip`, camel `chip`, tag `cosm-chip`.

## 1. Files

| Piece | Path | Required for |
| --- | --- | --- |
| Contract | `packages/core/src/specs/chip.ts` | all |
| Shared scenarios | `packages/core/src/specs/chip.scenarios.ts` | all |
| Core exports and registry | `packages/core/src/index.ts` (`chipContract` in `contracts`) | all |
| Catalog entry | `packages/core/src/catalog.ts` | all |
| Web Component | `packages/elements/src/components/chip/cosm-chip.ts` + subpath export `./chip` | web |
| Web tests | `packages/elements/test/chip.test.ts` | web |
| React wrapper | `packages/react/src/components/chip.ts` | web |
| React tests | `packages/react/test/chip.test.tsx` | web |
| Angular proxy | `packages/angular/src/components/chip.component.ts` (+ `COSMOS_COMPONENTS`) | web |
| Angular tests | `packages/angular/test/chip.test.ts` | web |
| React Native component | `packages/native/src/components/chip.tsx` | native |
| React Native tests | `packages/native/test/chip.test.tsx` | native |
| Native demo screen | `apps/native-demo/app/chip.tsx` (+ entry in `src/screens.ts`) | native |
| Docs pages | `apps/docs/src/content/docs/components/chip.mdx` and `…/es/components/chip.mdx` | all |
| AI reference | a `cosm-chip` section in `packages/elements/llms.md` (web) / `Chip` in `packages/native/llms.md` (native) | all |
| Changeset | `.changeset/add-chip.md` | all |

## 2. Order inside each file

### Contract (`specs/chip.ts`)

1. Imports. 2. Detail types (`ChipRemoveDetail`…). 3. JSDoc + `export const chipContract = defineContract({…})`
with the keys in this order: `name`, `tag`, `description`, `platforms` (optional), `role`, `pattern`,
`props`, `events`, `states`, `slots`, `parts`, `cssProperties`, `keyboard`.

### Scenarios (`specs/chip.scenarios.ts`)

1. Imports. 2. Action and scenario types. 3. `export const chipScenarios`. 4. `export const chipScenariosFor`.

### Web Component (`cosm-chip.ts`)

1. **Imports** (external, then internal).
2. **Types** (`export type ChipVariant = …`), derived from the contract with `ContractProps`.
3. **Styles**: `const styles = css\`…\`` (tokens with fallbacks, `:host` first, then parts, states and
   `prefers-reduced-motion` last).
4. **Class** `export class CosmChip extends CosmElement`, preceded by its JSDoc. Inside the class:
   1. static fields (`formAssociated`, `shadowRootOptions`, `properties`, then
      `styles = [boxSizing, focusRing, styles]` — shared styles first, component styles last);
   2. `declare` fields for reactive properties, then private fields (`#internals`…);
   3. `constructor()` (contract defaults);
   4. lifecycle (`connectedCallback`, `willUpdate`, `updated`…);
   5. public API (getters, methods such as `focus()`, `click()`);
   6. private handlers (`#onClick = (event) => {…}`);
   7. `protected override render()` — always last.
5. **Registration**: `define('cosm-chip', CosmChip);` then `declare global { … }`.

JSDoc on the class, in this order: description, `@tag`, `@slot`, `@csspart`, `@fires`, `@cssprop`.

### React wrapper (`react/src/components/chip.ts`)

1. Imports. 2. `export const chipEvents = {…}` (React names → DOM events). 3. `export const Chip = createComponent({…})`.
4. `export type ChipProps = …`.

### Angular proxy (`chip.component.ts`)

1. Imports (Angular, core types, element types, side-effect import of the element).
2. JSDoc with a usage example. 3. `@Component({ selector: 'cosm-chip', … })`.
4. Class: `readonly element`, then `@Input()` setters (contract order), then `@Output()` emitters.

### React Native component (`native/src/components/chip.tsx`)

1. Imports. 2. Types (`ContractChipProps`, `export interface ChipProps`).
3. `export const chipPropNames` (checked by the drift test). 4. Private constants and helpers.
5. `export function Chip(…)`.

## 3. Tests

| File | `describe` blocks, in order |
| --- | --- |
| `elements/test/chip.test.ts` | `cosm-chip: shared scenarios`, `cosm-chip: contract drift`, then `cosm-chip` (platform specifics: forms, parts, focus…) |
| `react/test/chip.test.tsx` | `Chip: shared scenarios`, `Chip: contract drift` |
| `angular/test/chip.test.ts` | `CosmChipComponent` (inputs and outputs forwarding), `CosmChipComponent: contract drift` |
| `native/test/chip.test.tsx` | `Chip (native): shared scenarios`, `Chip (native): contract drift`, then `Chip (native)` |

Shared scenarios come from `chipScenariosFor(<platform>)`; drift tests compare with `propNames()` and
`eventNames()` of the contract.

## 4. Docs page

Frontmatter (`title`, `description`), imports, then:

1. `<StatusBadge name="chip" />` and an introduction (what it is, when to use it, reference pattern).
2. `## Playground` — `<Playground name="chip" … />`.
3. `## Variants` (`## Variantes`) — `<Preview>` examples.
4. `## States` (`## Estados`).
5. `## Accessibility` (`## Accesibilidad`).
6. `## API` — `<ApiTable name="chip" />`.
7. `## Events by platform` (`## Eventos por plataforma`) — `<EventsTable name="chip" />`.

The Spanish page has the same structure under `apps/docs/src/content/docs/es/components/`.
