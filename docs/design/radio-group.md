# Radio group design

## Approved scope

A standard single-selection form control for Web, React, Angular, and React Native. Inventory
classifies `radio-group` as planned, unblocked, and next-suggested. It has no stable component
dependencies. The implementation uses native radio inputs on Web and React Native primitives; it
adds no runtime dependency.

The group may start without a selection. `null` means no selection; an option value is a nonempty
string, so `''` is not reserved as a sentinel. `value` is controlled when supplied, including
`null`; `defaultValue` initializes autonomous state. Activating the selected option does not clear
it. Required validation is separate from the initial selection.

Options are a typed data collection with unique nonempty `value`, nonempty `label`, optional
`description`, and optional `disabled`. The group label is required and visible. The group supports
`orientation="vertical" | "horizontal"` and defaults to vertical; horizontal options wrap when
space is constrained. There is one standard circular-radio appearance. Like Checkbox, `size`
accepts `sm`, `md` (default), `lg`, or a positive finite number in CSS pixels on Web and logical
units on React Native. This affects the indicator, not the minimum interaction target.

## State and event mapping

| State | Autonomous | Controlled | Event |
| --- | --- | --- | --- |
| `value` | Starts at `defaultValue` (null by default); user selection commits | A supplied value, including null, proposes a selection without committing | `valueChange` |

User selection proposals use `{ value: string }`; a controlled Web form reset may also propose
`{ value: null }`. DOM dispatches `cosm-change`; React forwards the original event as `onChange`;
Angular forwards it as `valueChange` and integrates with `ControlValueAccessor`; React Native invokes
`onValueChange` with the detail. No event is emitted when the already-selected option is activated.

## Anatomy and appearance

The Web group uses a native `fieldset` and `legend` with associated `input type="radio"` controls
inside its shadow tree. Each option label activates its input. The form-associated host submits
only the selected `name=value`, participates in required validity and disabled-fieldset behavior,
and resets to `defaultValue`. Controlled reset proposes the default and waits for the owner. The
host, not the internal inputs, owns the public form value to prevent duplicate submission. React
Native has no HTML form lifecycle or browser constraint validation.

Parts: `base`, `label`, `options`, `option`, `input`, `control`, `indicator`, `option-label`,
`description`, `help-text`, and `error-text`.

The group label is the accessible name of the fieldset/radiogroup. Help and error text are
associated with the group; option descriptions are associated with their radio. The required group
sets native Web validity and `aria-required`. `invalid` and `errorText` provide externally
controlled invalid presentation; a nonempty error text also exposes invalid state. The component
does not infer validation timing from blur or submit. Web focus remains visible and distinguishable
from selection.

The visual appearance uses Cosmos tokens and documented CSS parts/custom properties. The Native
implementation uses `useTheme()` and typed layout/style overrides; each Pressable option has a
minimum 44-point target and exposes `radio` role with checked/disabled accessibility state. The
group exposes `radiogroup`. Native required/error feedback is descriptive, not HTML constraint
validation.

On all platforms, selection is drawn as a colored ring and a centered dot on the same background
as an unselected control. The dot stays distinct from the ring on hover, and keyboard focus uses
its own outline. On React Native Web the outline surrounds the option row and is shown for
keyboard focus, not pointer focus.

### Hover refinement

Follow Checkbox's pointer-hover hierarchy without changing selection or fill. On hover-capable Web
devices, enabled valid unchecked options change only the radio boundary to `primary`; selected
options change only the boundary to `primary-hover`. Disabled and invalid treatment takes
precedence, and focus remains separately visible. React Native uses Pressable hover events where a
pointer is available, clears hover on disable, and does not synthesize hover from touch. Caller
style hooks remain authoritative. There is no hover-driven event or value mutation.

No motion is needed for normal selection. If a transition is used for border/focus color, reduced
motion disables it. All styling uses semantic theme tokens and must be checked in Cosmos and Nebula
light/dark modes, including narrow and wide layouts.

## Keyboard and platform behavior

The component follows the ordinary, non-toolbar [WAI-ARIA Radio Group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/):

- Tab and Shift+Tab enter or leave the group as one tab stop. Entry targets the selected option or,
  when none is selected, the first enabled option.
- Space selects the focused option.
- Right/Down select and focus the next enabled option; Left/Up select and focus the previous one.
  Navigation wraps and skips disabled options.
- No Home/End extension, toolbar mode, read-only mode, or user-clearing behavior is included.

Web, React, and Angular use the same Lit implementation and native form semantics. React and
Angular are thin adapters. React Native renders a native Pressable row per option and supports
touch/screen-reader selection on iOS and Android plus browser behavior on React Native Web. The
Web keyboard contract applies to Web and React Native Web; TV and native hardware-keyboard
navigation are deferred. Android build/runtime acceptance is in scope. iOS device validation and
manual screen-reader testing are optional and remain unverified unless explicitly requested.

## Excluded and deferred

No card or segmented-button variants, icons, arbitrary HTML/JSX or custom option
renderers, nested interactive content, multi-selection, read-only state, clear-on-activation,
toolbar behavior, Home/End shortcuts, search, loading, virtualization, async validation, TV support,
native hardware-keyboard navigation, or new dependencies.

ADR 0005 establishes the Lucide icon set; this control draws its radio indicator with CSS and does
not consume an icon. The implementation follows [ADR 0001](../adr/0001-platforms-and-contracts.md)
for cross-platform contracts, [ADR 0003](../adr/0003-state-ownership-and-events.md) for controlled
state/event ownership, and [ADR 0004](../adr/0004-theming.md) for theming.

## Acceptance scenarios

1. A labeled group renders accessible radio options with one optional selected value and the
   standard medium appearance. The selected control retains the unselected background and shows
   a visible ring and dot, including in Web forced-colors mode.
2. Autonomous selection updates `value` and emits one `{ value }` proposal. Controlled selection,
   including controlled `null`, waits for owner acceptance; reactivating the selected option never
   clears it.
3. Arrow keys move and select with wrapping while skipping disabled options; Space selects, and
   Tab enters on the selected/first enabled option. Disabled groups/options cannot be selected.
4. Group and option descriptions, required, invalid, help, and error semantics are exposed without
   using color alone. Error visibility is controlled by the consumer.
5. Web submission includes exactly one selected enabled `name=value`; no selection is omitted.
   Required validity, form reset, disabled fieldset, and controlled reset proposals work.
6. React forwards the original bubbling/composed DOM `CustomEvent`; Angular value accessors
   write, change, touch, disable, and reset the string/null value correctly.
7. React Native uses accessible radio/radiogroup roles, checked/disabled state, 44-point targets,
   and whole-row touch activation without HTML form behavior.
8. Hover on enabled valid options changes only the boundary (unchecked `primary`, selected
   `primary-hover`), leaves value/fill unchanged, and restores on exit. Disabled/invalid priority,
   keyboard focus, and caller style overrides are retained; touch does not create hover.
9. Themes, contrast, RTL, reduced motion, narrow/wide layouts, and representative Web/React/Angular/
   React Native demos are validated. Android build/runtime is recorded separately; iOS and manual
   screen-reader results remain not verified (optional).

## Research references

- [WAI-ARIA APG Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)
- [WHATWG HTML radio state](https://html.spec.whatwg.org/multipage/input.html#radio-button-state-(type=radio))
- [MDN radio inputs and forms](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/radio)
- [React Aria RadioGroup](https://react-aria.adobe.com/RadioGroup) (Apache-2.0; behavior reference)
- [Radix Radio Group](https://www.radix-ui.com/primitives/docs/components/radio-group) (MIT; composition reference)
- [React Native Paper 5.14.5 RadioButton.Group](https://github.com/callstack/react-native-paper/blob/v5.14.5/src/components/RadioButton/RadioButtonGroup.tsx) (MIT; Native interaction reference)
- [React Native accessibility](https://reactnative.dev/docs/accessibility)

No reference implementation code or assets are copied. Bundle sizes were not measured.
