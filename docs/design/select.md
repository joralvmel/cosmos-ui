# Select design

## Approved scope

A single-selection control for Web, React, Angular, and React Native. The Web control uses a
custom select-only popup built with Cosmos Popover/Listbox patterns; React and Angular adapt that
implementation. React Native uses a Cosmos-styled popup with platform-appropriate placement and
dismissal. Native has no HTML form association.

The control has one standard/outlined visual variant and sizes `sm`, `md` (default), and `lg`.
Customization uses Cosmos theme tokens and documented component parts/hooks. The selected value
is a string or `null`; option values and primary labels are nonempty strings. Items may be flat or
grouped. Options may be disabled and may include a description and a decorative structured
`IconDefinition`.

`defaultValue` initializes autonomous selection. Supplying `value`, including `null`, makes the
selection controlled. User selection and clear actions propose a change; controlled selection
waits for the owner to supply the accepted value. Re-activating the selected option does not emit a
change. A clear action is shown only when `clearable` is enabled and has a consumer-supplied,
localized accessible name.

The required visible label names the trigger; placeholder text never replaces it. Supporting help
and error text are associated with the trigger and popup. `required`, `invalid`, `error`, and
`disabled` remain distinct. The component does not infer validation timing from blur or submit.
On Web, the host is form-associated, submits the selected enabled `name=value`, participates in
required validity, follows disabled fieldsets, and resets to `defaultValue`. A controlled reset
proposes the reset value and waits for owner acceptance. React Native has no HTML form lifecycle or
browser constraint validation.

## State and event mapping

| State | Autonomous | Controlled | Event |
| --- | --- | --- | --- |
| `value` | Starts at `defaultValue` (null by default); user selection/clear commits | A supplied value, including null, proposes a change without committing | `valueChange` |

Selection proposals use `{ value: string | null }`. The DOM event is `cosm-change`; React forwards
the original event as `onChange`; Angular forwards it as `valueChange` and integrates with
`ControlValueAccessor`; React Native invokes `onValueChange` with the detail. Owner prop updates
never emit proposals.

## Anatomy and appearance

Parts: `base`, `label`, `trigger`, `value`, `placeholder`, `clear-button`, `popup`, `listbox`,
`group`, `group-label`, `option`, `icon`, `content`, `option-label`, `description`, `help`, and
`error`.

The trigger is a keyboard-operable select-only combobox with committed `aria-expanded`,
`aria-controls`, `aria-haspopup="listbox"`, and the accessible label/help/error state. The popup
contains a single-selection listbox. The active option (keyboard focus) is independent of the
committed selection; moving through options never changes the value. Selected, active, disabled,
required, and invalid states are exposed programmatically and not by color alone. Clear is a
separately named button and does not open the popup. Popup closure restores focus only when
appropriate; Escape and outside dismissal do not commit a new value.

Sizes map to Cosmos control-height, spacing, and typography tokens (`--cosm-control-*`,
`--cosm-space-*`, `--cosm-text-*`). Colors, border, radius, focus ring, disabled/invalid
presentation and selected/active option treatment use semantic `--cosm-*` theme tokens with
fallbacks. Exposed custom properties use the `--cosm-select-*` prefix. Light/dark and all built-in
themes must retain at least 3:1 contrast for boundaries and 4.5:1 for text. Focus is visibly
distinct from selection. No transition is needed for selection; any optional visual transition
must respect reduced motion.

React Native uses `useTheme()`, reports `combobox`/`listbox`/`option` semantics and expanded,
selected, disabled, required, and invalid states where supported, and keeps touch targets at least
44 logical points. Android Back closes an open popup. Escape is supported on Web and React Native
Web; native iOS/Android do not promise hardware Escape. iOS and Android popup geometry/dismissal
may adapt to platform constraints while retaining the same selection contract.

## Keyboard and platform behavior

- Tab and Shift+Tab move into or out of the trigger normally; options are not separate Tab stops.
- Enter or Space opens the popup from the trigger and selects the active option while open.
- ArrowDown/ArrowUp move the active option without changing selection; Home/End move to the first
  or last enabled option.
- Printable characters perform locale-aware typeahead without filtering the option collection.
- Escape closes without changing the value and restores trigger focus when the trigger remains
  connected.
- Disabled options are skipped and cannot be selected. Tab does not wrap and selection is not
  committed by focus movement.
- Pointer/touch activation selects an enabled option and closes the popup. Selecting the current
  value does not emit a change.
- Clear proposes/commits `null` when the selected value is non-null and `clearable` is enabled.

Web, React, and Angular use the same Lit implementation, event, and native form semantics. React
Native mirrors the public selection contract using Cosmos primitives; it does not add a native
picker dependency or HTML form API.

## Excluded and deferred

Combobox search/filtering, multiselect/chips, async options, virtualization, tree options, bulk
actions, arbitrary interactive option content, platform-native picker UI, custom tones/variants,
loading state, and new dependencies.

## Acceptance scenarios

1. A required labeled Select renders the outlined medium trigger, placeholder, grouped options,
   optional descriptions/icons, disabled options, help/error text, and accessible state.
2. Autonomous selection commits and emits one `{ value }` proposal. Controlled selection,
   including controlled `null`, waits for owner acceptance; reselecting the current option emits no
   change.
3. Arrow keys, Home/End, typeahead, Enter/Space, Escape, Tab, pointer, and touch work as documented;
   active focus and committed selection remain distinct.
4. Disabled trigger/options cannot be selected. Clear is visible only when enabled, is separately
   labeled, and proposes/commits `null` without opening the popup.
5. Web submission includes exactly one selected enabled `name=value`; required validity, form
   reset, disabled fieldset, and controlled reset proposals work.
6. React forwards the original bubbling/composed DOM `CustomEvent`; Angular outputs and CVA write,
   change, touch, disable, and reset behavior follow the contract.
7. React Native preserves the same value ownership/event contract, exposes supported accessibility
   state, supports touch and Android Back, uses minimum 44-point targets, and has no HTML form API.
8. Light/dark built-in themes, RTL, reduced motion, narrow/wide layouts, visible focus, contrast,
   and representative demos on all four targets are validated. Android acceptance is recorded
   separately; iOS and manual screen-reader testing remain not verified (optional).

## Research references

- [WAI-ARIA APG select-only combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/)
- [WHATWG HTML select](https://html.spec.whatwg.org/multipage/form-elements.html#the-select-element)
- [React Aria Select](https://react-aria.adobe.com/Select) (Apache-2.0; behavior reference)
- [Radix Select](https://www.radix-ui.com/primitives/docs/components/select) (MIT; composition reference)
- [React Native Picker](https://github.com/react-native-picker/picker) (MIT; platform-native alternative, not used)
- [React Native accessibility](https://reactnative.dev/docs/accessibility)

No reference implementation code or assets are copied.

## Validation evidence

- Core, Web, React, Angular, React Native, native-demo, and docs typechecks/tests/builds passed.
  Vitest totals: core 83, Web 271, React 184, Angular 154, React Native 282, and docs 51.
- In the browser at 375×812, the docs Playground opened with ArrowDown, moved the active option
  without committing it, selected with a pointer, and closed with Escape while restoring trigger
  focus and retaining the selection. Five Web examples rendered; the browser reported only Lit's
  expected development-mode warning.
- In the Expo React Native Web demo, clear and option selection updated the controlled value; the
  grouped options and disabled, help-text, and error examples rendered.
- Across all six built-in themes in light and dark modes, browser-computed OKLCH contrast minima
  were 15.76:1 for trigger text, 3.22:1 for the trigger/popup boundary, 4.03:1 for the focus ring,
  and 5.39:1 for the error color.
- `npx expo export --platform android` passed. No Android device was attached and no emulator
  executable was available, so Android interaction remains unverified and the catalog readiness
  status stays `in-progress`.
- iOS interaction and manual screen-reader testing are not verified (optional).
