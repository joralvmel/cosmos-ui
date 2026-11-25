# Select design

## Approved scope

Select provides single selection from a flat collection of options on Web, React, Angular, and
React Native. Each option has a nonempty string `value` and `label`, and may be disabled.
Selection is autonomous with `defaultValue` or controlled with `value`; `null` represents no
selection. A user selection emits `{ value }`, while controlled state waits for the owner to accept
the proposal.

The visible label is required; placeholder text never names the control. Optional `helpText` and
`errorText` describe the field. The `required`, `invalid`, `errorText`, and `disabled` states remain
distinct. Web, React, and Angular use the form-associated custom element, including `name`,
required validity, disabled fieldsets, and reset behavior. Native exposes required/invalid semantics
but leaves validation timing and enforcement to the consumer.

The outlined variant is the default; filled is also supported. Sizes are `sm`, `md` (default), and
`lg`. Web styling uses Cosmos tokens, CSS parts, and documented `--cosm-select-*` hooks; set
`--cosm-select-trigger-min-height` for a custom minimum trigger height. Native accepts
`triggerStyle`; its minimum height cannot be less than 44 logical points.

## Interaction and accessibility

The Web trigger is a select-only combobox. DOM focus remains on the trigger while
`aria-activedescendant` identifies the active option. The active option is separate from the
committed value: ArrowUp/ArrowDown and Home/End move it without selecting; printable characters
perform typeahead; Enter or Space selects; Escape closes without changing the value. Options are not
Tab stops. Disabled options are skipped, and selecting the current option emits no change.
Pointer activation selects an enabled option. The Web popup uses the platform popover behavior and
Cosmos option styling; React and Angular forward the same implementation and event semantics.

React Native uses Cosmos Popover and Listbox behavior with platform-appropriate placement and
dismissal. React Native Web retains the Listbox keyboard behavior; native iOS/Android use touch and
platform accessibility navigation. Physical-key typeahead is deferred on native iOS/Android because
React Native core does not provide general keyboard events for this control. Native has no HTML
form association.

Trigger hover, expanded, invalid, disabled, and focus-visible feedback use theme tokens and remain
distinct from selection. The chevron rotates while expanded. Native touch targets remain at least
44 logical points. Motion respects reduced-motion preferences on Web.

## Excluded and deferred

Grouped options, per-option descriptions or icons, clearable selection, multiselect, search/filter,
async loading, virtualization, tree options, arbitrary interactive option content, and platform
native picker UI are out of scope. The field-level help and error text are included. No dependency is
added.

## Acceptance scenarios

1. A labeled Select renders flat options, placeholder, optional help/error text, disabled options,
   and accessible selected/active/required/invalid states.
2. Autonomous selection commits and emits once; controlled values, including controlled `null`,
   wait for the owner. Activating the current or a disabled option does not change the value.
3. Web keyboard navigation follows the select-only combobox pattern, keeping focus on the trigger
   and exposing the active option through `aria-activedescendant`.
4. Web, React, and Angular preserve event, controlled-state, and native form behavior. Native
   preserves selection semantics, a minimum 44-point target, and platform-supported accessibility.
5. Outlined/filled variants, `sm`/`md`/`lg` sizes, Web minimum-height customization, and Native
   `triggerStyle` are demonstrated.
6. Representative examples show autonomous/controlled values, filled styling, help/error,
   disabled state, and custom minimum height.

## Research references

- [WAI-ARIA APG select-only combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/)
- [WHATWG HTML select](https://html.spec.whatwg.org/multipage/form-elements.html#the-select-element)
- [React Aria Select](https://react-aria.adobe.com/Select) (Apache-2.0; behavior reference)
- [Radix Select](https://www.radix-ui.com/primitives/docs/components/select) (MIT; composition reference)
- [React Native Picker](https://github.com/react-native-picker/picker) (MIT; platform-native alternative, not used)
- [React Native accessibility](https://reactnative.dev/docs/accessibility)

No reference implementation code or assets are copied.

## Validation evidence

- `npx biome ci .`, `npx turbo run typecheck test build` (49 tasks), the structure test (16 tests),
  and `npm run check-terms` passed. Relevant suite totals: core 83, Web 272, React 183, Angular 154,
  React Native 283, docs 51, and MCP 7 tests.
- Browser verification on the docs Playground opened with ArrowDown, moved the active option from
  Apple to Cherry without changing the value, confirmed `aria-activedescendant` while focus remained
  on the combobox, then selected Cherry with Enter and confirmed the popup closed. Hover and expanded
  trigger styling, chevron rotation, filled appearance, and the 56px custom minimum height were also
  checked in the browser.
- A React wrapper was mounted in the browser. Keyboard selection emitted the expected `onChange`
  proposal while the controlled `null` value remained unchanged.
- The Angular wrapper was mounted in a browser with Reactive Forms. Selecting Cherry synchronized
  `FormControl.value` and `cosm-select.value` to `cherry`; the control was valid.
- The Android Expo bundle export passed. An installed API 35 AVD (`Pixel_9_API_35`) was present,
  but no emulator became available in `adb devices`, so the demo was not installed or interacted
  with. Native Android touch selection and Back dismissal remain unverified.
- React and Angular wrapper tests and React Native Web checks passed. iOS and manual screen-reader
  checks are optional and unverified.
- The component inventory remains `in-progress` because required Android runtime evidence is
  incomplete.
