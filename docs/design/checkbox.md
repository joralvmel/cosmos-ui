# Checkbox

## Purpose and reference pattern

A form-first, independent boolean choice for web, React, Angular and React Native. Follow the
[WAI-ARIA Checkbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/) and the shared
contract and state-ownership rules in [ADR 0001](../adr/0001-platforms-and-contracts.md) and
[ADR 0003](../adr/0003-state-ownership-and-events.md).

## Accepted scope

- One visual treatment; no variants, tone or color props.
- `checked` is controlled when bound; otherwise `defaultChecked` initializes autonomous state.
  An enabled user toggle proposes the next boolean through `checkedChange`. Autonomous use commits
  the value and clears mixed presentation. Controlled use waits for the owner to accept or reject
  the proposal.
- `indeterminate` is presentation-only. It exposes a mixed state but does not define a third value
  or add an event.
- A required nonempty `label` names the checkbox. `hideLabel` visually hides it. An optional default
  slot adds noninteractive inline label content; links and buttons are not allowed in the label.
- `size` is `sm`, `md`, `lg` or a positive finite number. Presets use the icon-size scale
  (16/20/24 CSS px); numeric size is CSS px on web and logical units on native. It changes only the
  visual box. Native touch targets remain at least 44pt.
- `disabled`, `required`, `invalid`, `helpText` and `errorText` cover interaction and validation
  presentation. A nonempty `errorText` also marks the control invalid. Help and error strings are
  supplied and localized by the consumer.
- Web, React and Angular expose `name` and `value` for form submission (`value` defaults to `on`).
  Web uses form association for submission, required validity, reset and disabled-fieldset behavior.
  Angular integrates through `ControlValueAccessor`; its value is the checked boolean.
- React forwards the original DOM `CustomEvent`; Angular re-emits it and integrates with forms.
  React Native has no HTML form lifecycle or automatic required/invalid validation; it provides
  checkbox role/state, descriptive help/error text and the 44pt target.
- Styling uses Cosmos tokens, the documented web CSS custom properties/parts, and React Native
  layout styles. Check and minus marks use the structured `check` and `minus` icon definitions
  through the existing platform renderers, following [ADR 0005](../adr/0005-icons-lucide.md).

## State and event mapping

| State | Autonomous | Controlled | Event |
| --- | --- | --- | --- |
| `checked` | Initializes once from `defaultChecked`; user activation commits | A supplied `checked`, including `false`, remains unchanged until the owner updates it | `checkedChange` |
| `indeterminate` | Presentation only; autonomous activation clears it | Remains as supplied until the owner changes it | None |

The DOM event is `cosm-checked-change`, React uses `onCheckedChange`, Angular uses
`checkedChange`, and React Native uses `onCheckedChange`. The shared detail is
`{ checked: boolean }`; DOM and wrappers preserve the typed `CustomEvent`, while native receives
the detail.

## Anatomy and appearance

Parts are `base`, `input`, `box`, `label`, `help-text` and `error-text`. The hidden native checkbox
input provides web keyboard, checked, required and label semantics. The visible box uses the
`--cosm-checkbox-size`, `--cosm-checkbox-background`, `--cosm-checkbox-checked-background`,
`--cosm-checkbox-color`,
`--cosm-checkbox-border`, `--cosm-checkbox-radius`, `--cosm-checkbox-focus` and
`--cosm-checkbox-gap` hooks with theme-token defaults. Check/minus icons are decorative.

The web input remains the focus target and exposes a visible `:focus-visible` indicator. Help and
error text are referenced with `aria-describedby`; invalid state is exposed with `aria-invalid`.
Native exposes `accessibilityRole="checkbox"`, checked/mixed/disabled state, and associated
localized help/error as an accessibility hint. React Native does not expose equivalent required or
invalid states; consumers include required information in localized label/help text as needed.

## Excluded and deferred

No checkbox groups, select-all/bulk-selection behavior, table or multi-select integration, extra
visual variants, interactive label content, mixed-state restoration, added localization or new
dependencies. iOS runtime validation and manual screen-reader testing are optional and will be
reported as not verified unless requested.

## Acceptance scenarios

- Starts unchecked by default; `defaultChecked` initializes an autonomous checked value.
- Autonomous pointer, keyboard and native touch activation toggles and emits one checked proposal.
- Controlled `false` refuses to self-commit; accepting or rejecting a proposal follows the owner’s
  next `checked` value.
- Autonomous activation clears indeterminate presentation; controlled activation leaves it to the
  owner. Mixed state is announced as mixed on web and native.
- Disabled controls do not toggle or emit. Required and invalid states retain the accessible name;
  help/error descriptions remain associated.
- Web form submission includes only checked, enabled values; reset restores the default in
  autonomous use, and disabled fieldsets disable the control. Required validity is exercised.
- Angular forms write, change, touch and disable the boolean control. React and Angular callbacks
  preserve the original event detail.
- Presets and numeric sizing affect only the visual box; invalid sizes fail explicitly. Native
  touch targets remain at least 44pt.
- Docs and native demo exercise controlled acceptance/refusal, sizes, mixed, disabled, required,
  invalid and help/error states in the supported themes.
