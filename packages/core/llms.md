# @joralvmel/cosmos-core

Contracts (source of truth of every component on every platform), the component catalog, shared behavior scenarios, headless logic and helpers to generate code snippets and setup guides.

<!-- generated:start (npm run llms, do not edit this block by hand) -->

## Install

```bash
npm install @joralvmel/cosmos-core
```

## Contracts

Each contract is the source of truth of a component on every platform (`contracts.<name>`).

### `button` (`<cosm-button>`)

Triggers an action or submits a form.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | 'solid' \| 'soft' \| 'outline' \| 'ghost' | `solid` | Visual emphasis, from highest (solid) to lowest (ghost). |
| `tone` | 'primary' \| 'neutral' \| 'danger' | `primary` | Color role. Use danger for destructive actions. |
| `size` | 'sm' \| 'md' \| 'lg' | `md` | Control height and padding. |
| `disabled` | boolean | `false` | Prevents interaction and removes the button from the tab order. |
| `loading` | boolean | `false` | Shows a spinner, sets aria-busy and ignores presses while keeping focus. |
| `fullWidth` | boolean | `false` | Stretches the button to the width of its container. |
| `type` | 'button' \| 'submit' \| 'reset' | `button` | Form behavior of the button. |
| `label` | string | — | Accessible name when the visible content is not descriptive (icon-only buttons). |

**Events**

| DOM | React | Angular | React Native | Detail | Description |
| --- | --- | --- | --- | --- | --- |
| `cosm-press` | `onPress` | `(press)` | `onPress` | `ButtonPressDetail` | The button was activated by pointer, keyboard or programmatically. |

**Slots**

| Name | Description |
| --- | --- |
| `(default)` | Button label. |
| `start` | Content before the label, usually an icon. |
| `end` | Content after the label, usually an icon. |

**CSS parts**

| Name | Description |
| --- | --- |
| `base` | The native button element. |
| `label` | Wrapper of the label slot. |
| `spinner` | Loading indicator. |

**CSS custom properties**

| Name | Description |
| --- | --- |
| `--cosm-button-radius` | Corner radius. |
| `--cosm-button-gap` | Space between icon and label. |
| `--cosm-button-font-weight` | Label font weight. |

**Keyboard**

| Keys | Action |
| --- | --- |
| `Enter`, `Space` | Activates the button. |

### `icon` (`<cosm-icon>`)

Renders a structured SVG icon. Decorative icons are hidden from assistive technology; informative icons require a text label.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | IconDefinition | Required | Structured icon definition, commonly imported from @joralvmel/cosmos-icons. |
| `size` | 'sm' \| 'md' \| 'lg' \| number | `md` | Semantic size (16, 20 or 24) or a positive finite number in pixels / native units. |
| `stroke` | string | `currentColor` | Stroke paint; currentColor inherits on web and resolves to the theme foreground on native. |
| `fill` | string | `none` | Root fill paint. Explicit node fills take precedence. |
| `strokeWidth` | number | `2` | Finite nonnegative stroke width in SVG viewBox units. |
| `label` | string | — | Accessible name required when decorative is false. |
| `decorative` | boolean | `true` | Hides the icon from assistive technology when true. |

**Events**

No events.

**CSS parts**

| Name | Description |
| --- | --- |
| `icon` | Rendered SVG image. |

**CSS custom properties**

| Name | Description |
| --- | --- |
| `--cosm-icon-size` | Override the rendered icon width and height. |

### `text-field` (`<cosm-text-field>`)

Accepts a single line of text with an accessible label, optional help and error text, and native form validation on the web.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | string | Required | Accessible name for the editable control. It is rendered above the control unless visually hidden. |
| `labelHidden` | boolean | `false` | Visually hides the label while keeping it available to assistive technology. |
| `value` | string | — | Current text. When bound, edits are proposals and the component waits for the owner to supply the accepted value. |
| `defaultValue` | string | `` | Initial value for autonomous use. Web form reset restores this value; it does not control subsequent edits. |
| `type` | 'text' \| 'email' \| 'password' \| 'tel' \| 'url' \| 'search' | `text` | Single-line input type. Native maps it to supported keyboard, autofill and secure-entry behavior. |
| `variant` | 'outlined' \| 'filled' | `outlined` | Visual treatment of the editable control. |
| `size` | 'sm' \| 'md' \| 'lg' \| number | `md` | Semantic size or a positive finite minimum editable-control height in CSS pixels on web and logical units on native. |
| `placeholder` | string | — | Short input hint; it never replaces the accessible label. |
| `helpText` | string | — | Optional supporting text associated with the editable control. |
| `error` | string | — | Optional externally supplied error text associated with the editable control. |
| `invalid` | boolean | `false` | External invalid state, independent of browser constraints or consumer business validation. |
| `required` | boolean | `false` | Exposes required semantics. On web, participates in native HTML constraint validation. |
| `disabled` | boolean | `false` | Disables editing and interaction. On web, follows disabled fieldsets and excludes the value from form submission. |
| `readOnly` | boolean | `false` | Prevents editing while remaining focusable and form-submittable on web; distinct from disabled. |
| `minLength` | number | — | Minimum number of characters. Web uses native HTML validity; native business validation remains the consumer’s responsibility. |
| `maxLength` | number | — | Maximum number of characters. Web uses native HTML validity and native applies supported input limits. |
| `pattern` | string | — | Web-only HTML pattern constraint. Native does not emulate HTML regular-expression validation. |
| `name` | string | — | Form field name on web. React Native has no HTML form association or name-based submission. |
| `autoComplete` | string | — | Consumer-provided completion/autofill hint, mapped to attributes supported by each platform. |
| `inputMode` | 'none' \| 'text' \| 'decimal' \| 'numeric' \| 'tel' \| 'search' \| 'email' \| 'url' | — | Input or keyboard hint (none, text, decimal, numeric, tel, search, email or url); it does not add numeric or multiline field behavior. |
| `startIcon` | IconDefinition | — | Optional structured decorative icon before the editable text. |
| `endIcon` | IconDefinition | — | Optional structured decorative icon after the editable text. |
| `iconFocusScope` | 'control' \| 'input' | `control` | When configured icon focus colors apply: control includes the input and clear/reveal buttons; input includes only the editable input. Does not change icons without a focus-color override. |
| `prefix` | string | — | Optional non-interactive text decoration before the editable text. |
| `suffix` | string | — | Optional non-interactive text decoration after the editable text. |
| `clearable` | boolean | `false` | Shows a clear action for non-empty editable fields. Supply clearLabel when enabled. |
| `clearLabel` | string | — | Consumer-supplied localized accessible name for the clear action. |
| `passwordReveal` | boolean | `false` | Opts into a reveal action for password fields. Supply both revealPasswordLabel and hidePasswordLabel when enabled. |
| `revealPasswordLabel` | string | — | Consumer-supplied localized accessible name while the password is concealed. |
| `hidePasswordLabel` | string | — | Consumer-supplied localized accessible name while the password is revealed. |

**Events**

| DOM | React | Angular | React Native | Detail | Description |
| --- | --- | --- | --- | --- | --- |
| `cosm-change` | `onChange` | `(valueChange)` | `onValueChange` | `TextFieldChangeDetail` | Proposes the current text after each user edit, including clear; this is not a blur/commit event. |
| `cosm-submit` | `onSubmit` | `(submit)` | `onSubmitEditing` | `TextFieldSubmitDetail` | Reports the current text when the user invokes the field submit action (Enter/return). |

**CSS parts**

| Name | Description |
| --- | --- |
| `label` | Accessible label above the control. |
| `control` | Visual control containing the editable input and decorations. |
| `input` | The single-line editable input. |
| `start` | Start icon or prefix decoration. |
| `end` | End icon, suffix decoration or clear/reveal action. |
| `help` | Supporting text associated with the editable input. |
| `error` | External or native-validity error text associated with the editable input. |
| `clear-button` | Optional accessible clear action. |
| `reveal-button` | Optional accessible password visibility action. |

**CSS custom properties**

| Name | Description |
| --- | --- |
| `--cosm-text-field-background` | Editable control background. |
| `--cosm-text-field-color` | Editable and decoration text color. |
| `--cosm-text-field-placeholder` | Placeholder text color. |
| `--cosm-text-field-border` | Editable control boundary color. |
| `--cosm-text-field-focus` | Visible focus indicator color. |
| `--cosm-text-field-radius` | Editable control corner radius. |
| `--cosm-text-field-start-icon-color` | Start icon color, independent of text and affixes. |
| `--cosm-text-field-start-icon-focus-color` | Start icon color within iconFocusScope; falls back to its normal color. |
| `--cosm-text-field-end-icon-color` | End icon color, independent of text and affixes. |
| `--cosm-text-field-end-icon-focus-color` | End icon color within iconFocusScope; falls back to its normal color. |

**Keyboard**

| Keys | Action |
| --- | --- |
| `Tab`, `Shift+Tab` | Moves focus to or from the enabled editable control. |
| `Enter` | Invokes the submit action; web form behavior remains native. |

### `icon-button` (`<cosm-icon-button>`)

Activates an action or toggles a boolean state using a labeled icon.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | string | Required | Required localized accessible name. Missing, empty or whitespace-only labels are rejected. |
| `mode` | 'action' \| 'toggle' | `action` | Action activates without toggle state; toggle exposes and changes pressed state. |
| `variant` | 'solid' \| 'soft' \| 'outline' \| 'ghost' | `solid` | Visual emphasis, from highest (solid) to lowest (ghost). |
| `tone` | 'primary' \| 'neutral' \| 'danger' | `primary` | Color role. Use danger for destructive actions. |
| `size` | 'sm' \| 'md' \| 'lg' | `md` | Size of the square visual control. |
| `disabled` | boolean | `false` | Prevents activation and removes the web button from the tab order. |
| `type` | 'button' \| 'submit' \| 'reset' | `button` | Native web button form behavior. |
| `pressed` | boolean | `false` | Toggle state. If supplied, including false, activation proposes changes without committing them until the owner updates this prop. |
| `defaultPressed` | boolean | `false` | Initial toggle state when pressed is not supplied; it does not control later changes. |

**Events**

| DOM | React | Angular | React Native | Detail | Description |
| --- | --- | --- | --- | --- | --- |
| `cosm-press` | `onPress` | `(press)` | `onPress` | `IconButtonPressDetail` | Reports each enabled activation by pointer, keyboard or programmatically. |
| `cosm-pressed-change` | `onPressedChange` | `(pressedChange)` | `onPressedChange` | `IconButtonPressedChangeDetail` | Reports the proposed next pressed state on toggle activation; controlled state waits for the owner. |

**Slots**

| Name | Description |
| --- | --- |
| `(default)` | Decorative icon content; the label supplies the accessible name. |

**CSS parts**

| Name | Description |
| --- | --- |
| `base` | The native button element. |

**CSS custom properties**

| Name | Description |
| --- | --- |
| `--cosm-icon-button-background` | Control background. |
| `--cosm-icon-button-color` | Icon foreground color. |
| `--cosm-icon-button-border` | Control border color. |
| `--cosm-icon-button-radius` | Control corner radius. |
| `--cosm-icon-button-focus` | Visible focus indicator color. |

**Keyboard**

| Keys | Action |
| --- | --- |
| `Tab`, `Shift+Tab` | Moves focus to or from the enabled button. |
| `Enter`, `Space` | Activates the button; toggle mode also proposes a change. |


## Rules for AI assistants

- Use Cosmos components before writing custom UI; check `list_components` / the component status page for what exists.
- Style with Cosmos tokens: `var(--cosm-*)` in CSS or the Tailwind theme utilities (`bg-primary`, `text-fg-muted`, `rounded-md`). Never hard-code colors.
- Set the theme and mode with `data-theme` and `data-mode` on the root element (or `CosmosThemeProvider` on React Native).
- Keep accessibility: give icon-only buttons a `label`, never rely on color alone, keep keyboard support.
- Never render untrusted HTML (`innerHTML`, `dangerouslySetInnerHTML`) and never build class names from user input.

<!-- generated:end -->
