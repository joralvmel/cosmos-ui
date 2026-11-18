# Switch

## Purpose and approved scope

A binary, immediate setting control for preferences such as notifications. Follow the
[WAI-ARIA Switch Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/) and the shared state
ownership rules in [ADR 0003](../adr/0003-state-ownership-and-events.md).

One standard track-and-thumb treatment is included. The label is plain, nonempty text and remains
the stable accessible name in both states. Optional help text is stable across toggles. The label
is centered beside the control, with help text below; `hideLabel` visually hides only the label.
The web/React/Angular `size` accepts `sm`, `md`, `lg` or a positive finite number. Native
does not expose size and uses the platform `Switch` system sizing without scaling; the surrounding
touch target is at least 44pt.

## API and behavior

| Property | Default / availability | Meaning |
| --- | --- | --- |
| `label` | Required on all platforms | Nonempty plain text; stable accessible name. No label slot or interactive children. |
| `hideLabel` | `false`, all | Visually hides the label but keeps its accessible name. |
| `checked` | `false`, all | Controlled when supplied/bound, including `false`; an activation emits a proposal and does not self-commit. |
| `defaultChecked` | `false`, all | Initial value for autonomous state; subsequent changes do not reset it. |
| `size` | `md`, web/React/Angular | `sm`, `md`, `lg` or positive finite CSS-pixel size. Not exposed on native. |
| `disabled` | `false`, all | Blocks user interaction. Web excludes disabled switch from form submission and honors disabled fieldsets. |
| `helpText` | Optional, all | Supporting text adjacent to the label and associated with the control. |
| `name` | Optional, web/React/Angular | Form field name. Not part of the native API. |
| `value` | `on`, web/React/Angular | Submitted only when checked and enabled. Not part of the native API. |

No required, invalid, error, read-only, mixed, loading, variant, icon or on/off-text states are
included. The track and thumb are the only visual control content. No label slot or interactive
children are supported. Native also omits `name` and `value` because it has no HTML form API.

### State ownership and event mapping

| State | Autonomous | Controlled | Event |
| --- | --- | --- | --- |
| `checked` | Initialize from `defaultChecked`; activation commits the next boolean | A supplied/bound `checked`, even `false`, remains unchanged until the owner updates it | `checkedChange`, detail `{ checked: boolean }` |

DOM dispatches bubbling, composed `cosm-checked-change` as a typed `CustomEvent`. React exposes
`onCheckedChange` and forwards the original event. Angular exposes `checkedChange` and re-emits the
original event. React Native calls `onCheckedChange(detail)`. Native framework `Switch` changes are
requests; controlled rejection or delay must restore/preserve the owner-provided position.

The web input is a checkbox with `role="switch"`, native Space/keyboard behavior, visible
`:focus-visible` indication, and a label associated with it. Switch has two states only. Form
association submits the checked value, resets autonomous state to its default, ignores disabled
controls, and honors disabled fieldsets. Angular's ControlValueAccessor represents checked as a
boolean. Native has no HTML form lifecycle and uses the built-in React Native `Switch`, aliased as
`NativeSwitch`.

## Anatomy and customization

Parts: `base`, `input`, `track`, `thumb`, `label`, `help-text`. The input is the web focus target;
the visible track/thumb communicate state without icons or text. The web component uses Cosmos
tokens and exposes `--cosm-switch-*` custom properties for track, thumb, label spacing, radius and
focus styling, including the track border. It provides CSS parts for the documented anatomy. Native colors come from `useTheme()`
and supported `Switch` color props.

Keyboard: `Tab` / `Shift+Tab` moves focus; `Space` toggles. The control has a persistent accessible
name and help text association; checked and disabled are exposed through platform semantics.
Motion is tokenized and reduced when `prefers-reduced-motion` is requested.

## Acceptance scenarios

- Starts off; `defaultChecked` initializes autonomous on state.
- Autonomous activation toggles immediately and emits the next checked value.
- Bound `checked={false}` emits repeated `true` proposals without self-committing; accepting or
  rejecting/delaying proposals follows the owner's next value.
- Disabled controls do not toggle or emit. Native UI rejection preserves the controlled position.
- Web switch has checkbox input semantics with `role="switch"`, stable accessible name, help text,
  Space operation and visible focus.
- Web form includes only checked, enabled `name=value`; reset restores autonomous default and
  disabled fieldsets disable the switch. Angular Forms reads/writes/touches/disables the boolean.
- Size presets and positive finite numeric values work on web; invalid numeric values fail
  explicitly. Native exposes no size prop, uses system sizing and maintains a 44pt hit target.
- Label and help layout remains stable when checked changes. Docs and native demo show sizing,
  controlled accept/refuse and autonomous usage, disabled, hidden label, help text and token
  customization.
- Playground always supplies a required label and does not provide child label content on server
  render or after client hydration.

## Deferred

No label content slots, decorative or semantic icons, track text, tri-state, validation, read-only,
loading, variants or additional dependencies. Android runtime validation is explicitly deferred by
the user and will be reported as unavailable/not verified. iOS and manual screen-reader checks are
optional and will be reported as not verified.

## Validation evidence

- Web browser: pointer and Space activation, keyboard focus, checked-only form values, reset,
  disabled fieldsets, and stable centered labels/help passed.
- React browser: original CustomEvent forwarding, controlled acceptance and refusal passed.
- Angular browser: boolean Forms updates, keyboard blur/touched, model reset/disabled, and direct
  controlled acceptance/refusal passed.
- React Native Web demo: built-in Switch interaction, controlled acceptance/refusal, autonomous
  state, Space, disabled, hidden-label naming and a 44-by-44 target passed. Native colors were
  exercised through the home screen's Cosmos/Nebula and light/dark controls. Web's built-in input
  supplies its own switch role; repeating that role on its wrapper creates duplicate semantics.
- Web Cosmos/Nebula light/dark: track boundary and thumb contrast exceeded 3:1 and label contrast
  exceeded 4.5:1. Numeric and preset sizes, a hidden-label 44-by-44 minimum target, 390px layout,
  forced-colors thumb visibility and reduced-motion transitions passed.
- Playground: localized invalid-size feedback preserves the last valid preview; native snippets
  omit web-only size/name/value.
- Native unit tests use mocks. Expo's Web export is not an Android/iOS device test. Android runtime
  is unavailable (`adb devices -l` listed no devices), deferred as approved; iOS and manual screen
  readers remain not verified (optional).
