# Textarea design

## Approved scope

`textarea` is a generic plain-text multiline control exposed as `<cosm-textarea>`, `Textarea` in
React and Angular forms, and `Textarea` in React Native. It uses a native `<textarea>` on the web
and a multiline native `TextInput`. It is independent of the single-line text field.

The public contract includes a required accessible `label`; `labelHidden` (default `false`),
`placeholder`, `helpText`, `error`, controlled `value`, autonomous `defaultValue` (default `''`),
`rows` (default `4`), `maxLength`, `required`, `disabled`, `readOnly`, external `invalid`,
`variant` (`outlined` by default, or `filled`), and `size` (`md` by default; `sm`, `md`, or `lg`).
Rows control the visible line count and are separate from visual size. Web form controls also
accept `name` for native form submission. No numeric/custom size extension is included.

Web form behavior remains native: name/value submission, required and maximum-length constraints,
disabled-fieldset behavior, read-only focus/submission, and reset to `defaultValue`. Autonomous
reset commits the default; controlled reset emits a proposal and waits for the owner. Native form
validation is not emulated in React Native.

Visual styling uses Cosmos tokens. Web exposes documented `label`, `control`, `textarea`, `help`,
and `error` parts and `--cosm-textarea-*` custom properties. React Native follows the active Cosmos
theme and permits standard `style`, `inputStyle`, `labelStyle`, `helpStyle`, and `errorStyle`
overrides plus an `appearance` hook for background, text, placeholder, border, focus, and radius.
An enabled, valid Web control changes its border on hover; focus also applies a subtle themed
background and visible focus ring. Disabled and invalid controls do not receive the hover treatment.
No arbitrary content slots are provided.

## State ownership and events

| State | Default source | Unbound ownership | Bound ownership | Event detail |
| --- | --- | --- | --- | --- |
| `value` | `defaultValue` | User edits update the component's value and emit a change proposal. | User edits propose a value without committing it; the owner must update `value`. Empty string remains a bound value. | `{ value: string }` |

`controlled` ownership metadata takes precedence over binding inference where the wrapper supports
it. React treats a defined `value` (including `''`) as controlled. Angular direct `value` input is
controlled; `ControlValueAccessor` writes remain autonomous drafts until Angular accepts them,
including `updateOn: 'blur'`.

| Platform | Event/callback | Payload |
| --- | --- | --- |
| DOM | `cosm-change` | Original bubbling, composed `CustomEvent<TextareaChangeDetail>` with `detail: { value }` |
| React | `onChange` | Original DOM `CustomEvent<TextareaChangeDetail>` |
| Angular | `valueChange` | Original DOM `CustomEvent<TextareaChangeDetail>` |
| React Native | `onValueChange` | `TextareaChangeDetail` (`{ value }`) |

Enter inserts a newline. There is no custom submit-on-enter event or behavior.

## Accessibility and styling

- The non-empty label is required. `labelHidden` visually hides it but preserves its accessible
  name. Placeholder text is never the label.
- Help and error text are programmatically associated with the editable control. External `invalid`
  and non-empty `error` expose invalid semantics; browser constraints remain native.
- Focus is delegated to the native editor on web and remains visible. Disabled and read-only states
  use native semantics. Native accessibility uses the supplied label and hint; platform-required
  information is not inferred from placeholder text.
- Styling supports light/dark mode and the built-in Cosmos themes, uses tokens, and honors reduced
  motion. No animation is needed for normal textarea behavior.

## Exclusions

No auto-grow, character counter, icons, arbitrary slots, rich-text formatting, mentions,
attachments, autosave, or custom submit behavior. No new dependency is required.

## Acceptance scenarios

1. A labeled default control renders a native multiline editor with `rows=4`, outlined/medium
   styling, and a visible label.
2. `labelHidden` retains the accessible name; help/error descriptions are associated, and external
   invalid state is exposed accessibly.
3. Autonomous edits update the value and emit `{ value }`; controlled edits (including
   `value=""`) emit proposals without committing. A delayed or ignored controlled proposal keeps
   the owner's value.
4. `disabled` blocks editing and web submission; `readOnly` remains focusable and submits its
   value. Native `required` and `maxLength` constraints are preserved.
5. Web submission uses `name` and current value; form reset restores autonomous `defaultValue` and
   proposes that default for controlled use.
6. Enter inserts a newline without emitting a submit event. Rows and visual size vary independently.
7. React and Angular forward the original DOM `CustomEvent`; Angular CVA writes, change, touch,
   disabled state, and delayed form updates stay synchronized. React Native uses multiline
   `TextInput`, maps rows to supported native line sizing, and invokes `onValueChange` with
   `{ value }`.
8. Keyboard focus, labels, invalid/help/error relationships, Cosmos theme tokens and documented
   customization hooks work across supported platforms. On Web, hover changes the enabled valid
   border, and focus also changes the background while keeping the focus ring visible.

## API plan

- **Properties:** the contract properties listed above; `name` is web/React/Angular only. React
  Native additionally accepts platform style and theme customization hooks.
- **Events:** `cosm-change` / React `onChange` / Angular `valueChange` / native `onValueChange`,
  all carrying the value-change detail contract.
- **Slots:** none.
- **Web parts:** `label`, `control`, `textarea`, `help`, `error`.
- **CSS custom properties:** `--cosm-textarea-background`, `--cosm-textarea-color`,
  `--cosm-textarea-placeholder`, `--cosm-textarea-border`, `--cosm-textarea-focus`, and
  `--cosm-textarea-radius`.
- **Accessibility:** required label, associated help/error, invalid semantics, native keyboard and
  form behavior, visible focus, and reduced-motion-safe styling.
- **Form behavior:** form-associated web custom element; native React Native form submission and
  HTML required validation do not apply.
