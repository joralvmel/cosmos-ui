# Listbox

## Accepted scope

A reusable vertical selection primitive for web, React, Angular and React Native. Research follows
the [WAI-ARIA Listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/), compared with
React Aria, Zag and Tamagui. Implement original Cosmos behavior without new dependencies.

- Single and multiple selection; single by default. Arrows move focus without selecting.
  Enter/Space commits; pointer/touch activates an option. Multiple selection needs no modifiers.
- Controlled and autonomous selection, represented as readonly string arrays in both modes.
  Empty arrays mean no selection; single mode permits at most one value.
- A common data collection with globally unique nonempty option values, text, optional short
  description, structured icon definition and disabled state. Optional named groups.
- Required accessible label, visible by default and optionally visually hidden.
- Global disabled and read-only states; individual options may be disabled. Read-only permits
  exploration but never proposes selection changes.
- Web and RN Web: one Tab stop, visible active focus, arrows, Home/End, locale-aware typeahead
  without filtering, and scrolling to keep the active option visible.
- Android/iOS: touch and native accessible names/selection/disabled states. Native hardware
  keyboard and D-pad navigation are deferred.

## Ownership and events

| State | Autonomous | Controlled | Event |
| --- | --- | --- | --- |
| Selected values | Initialize once from defaultSelectedValues and commit activation | A supplied selectedValues, including an empty array, proposes without committing | selectionChange |
| Active option | Internal focus/navigation state, independent of selection | Not exposed as controlled public state | None |

DOM `cosm-selection-change`, React/native `onSelectionChange`, Angular `selectionChange`.
Web adapters forward the original typed CustomEvent; native receives its detail. Selection proposals
include the next selectedValues, activated value and pointer/keyboard source.

## Anatomy and appearance

Parts: base, label, list, group, group-label, option, icon, content, option-label, description and
indicator. Icons and selection indicators use existing Cosmos Icon renderers and individual Lucide
definitions according to ADR 0005; no icon catalog or checkbox dependency.

- Variants: plain and outlined; plain by default. No component-owned shadow.
- Sizes: sm, md, lg and a positive finite numeric minimum option height; md by default. Follow
  TextField's sizing precedent. Descriptions and text scaling can increase row height. Native
  touch targets remain at least 44 logical units.
- Use theme control sizes, spacing, text, foreground, background, border and primary tokens.
  Selected background and visible focus are distinct; disabled styling does not erase labels.
- Web CSS variables/parts and typed native style hooks customize colors, border, radius, typography,
  spacing, width and maximum height/scrolling. Defaults adapt to available width.
- Support inherited RTL and theme light/dark modes. Add no animation.

## Composition boundary

Standalone web Listbox uses roving option focus. Core contains pure collection traversal, selection
and typeahead helpers shared by platform implementations. Future Combobox must render input and
option semantics in a compatible tree rather than pointing across independent shadow roots.
Completing the inventory does not by itself solve future composite accessibility.

## Excluded and deferred

No nested interactive controls, custom rich-content templates, built-in filtering, remote loading,
virtualization, range/select-all shortcuts, horizontal layout, form submission/validation, built-in
loading/empty presentation or new dependencies. Consumers compose external status/empty content.
Popover remains separate. iOS and manual screen readers are not verified by default (optional).

## Acceptance evidence

- Shared scenarios: single/multiple activation, disabled/read-only, controlled refusal/acceptance,
  keyboard exploration without selection, groups and typeahead.
- Unit/API drift tests on all four platforms; invalid collection, selection and size inputs.
- Actual browser integration for Lit, React and Angular; RN Web roles, keyboard and touch.
- Representative docs/native controls for modes, sizes including numeric values, groups, states,
  styling and owner-controlled acceptance/refusal.
- Light/dark and built-in themes, narrow/wide layouts, labels, roles, focus and touch targets.
- Android export and actual emulator interaction recorded separately. iOS and manual readers stay
  not verified (optional).
- Repository checks, docs EN/ES, AI references and changesets; local review commit, no push or PR.

## Validation results

| Area | Result | Evidence |
| --- | --- | --- |
| Contract, shared scenarios and API drift | Passed | Full repository `npx turbo run typecheck test build`: 49 tasks passed |
| Web component | Passed | Actual docs browser: keyboard/typeahead, independent focus, disabled/read-only, numeric sizing, controlled refusal, reset and SVG touch toggling |
| React | Passed | Actual wrapper and generated snippet mounted in Vite; accepted/refused proposals, keyboard commit, disabled skip and selected-option Tab reentry |
| Angular | Passed | Actual zoneless wrapper and generated snippet; inputs/outputs, accepted/refused proposals and the same keyboard/reentry cases; form integration is outside this scope |
| React Native unit tests | Passed | 176 tests, including shared/drift cases and a real RN Web Pressable regression; these tests are not device evidence |
| React Native Web | Passed | Actual Expo demo: keyboard/touch, owner controls, labels/groups, states, numeric sizing and selected-option reentry without stealing external or pointer focus |
| Android export | Passed | `expo export --platform android` from the native demo workspace |
| Android runtime | Passed | Pixel 9 API 35, Expo Go: single/multiple touch selection, controlled refusal, read-only and disabled/selected accessibility states; final bundle smoke repeated after the focus fix |
| Visual/accessibility | Passed | Cosmos/Nebula light/dark, narrow/wide layouts, visible focus, native minimum 44-unit rows, web RTL and keyboard scrolling; measured selected text/description contrast exceeded 4.5:1 |
| iOS | Not verified (optional) | No export, simulator or device test attempted |
| Manual screen readers | Not verified (optional) | No NVDA, JAWS, VoiceOver or TalkBack session attempted |

Repository lint, blocked-terms checks and AI-reference generation also passed. Existing Biome
schema-version information remains unchanged. The shared Astro development toolbar reported stale
optimized-dependency 504s after rebuilds; component interactions and the separate wrapper harness
passed without new component errors.
