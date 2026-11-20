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

### `popover` (`<cosm-popover>`)

Non-modal content anchored to a consumer trigger, with cancelable close requests and no imposed panel semantics.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | boolean | `false` | Committed visibility. Supplying this prop, including false, controls state; its metadata default does not establish a binding. |
| `defaultOpen` | boolean | `false` | Initial autonomous visibility only; ignored when open is supplied. Later updates do not reset state. |
| `triggerMode` | 'press' \| 'hover' | `press` | Hover adds pointer and keyboard-focus opening on web and React Native Web, while keeping press activation. Android/iOS use press. Does not change panel semantics. |
| `closable` | boolean | `false` | Shows a built-in IconButton with an X. Requests a cancelable close with reason close-button. |
| `closeLabel` | string | `Close` | Localized accessible name of the close button. Must be non-empty when closable is true. |
| `gap` | number | `8` | Non-negative finite distance from trigger to panel, or to the arrow tip. CSS pixels on web, logical units on native. Viewport/safe-area collision handling takes priority. |
| `arrow` | boolean | `false` | Shows a decorative triangular pointer (16 wide, 8 deep), following the actual side, panel background and border. Hidden if it cannot point to the trigger without crossing a corner or viewport edge. |
| `closeOnEscape` | boolean | `true` | Requests closure on unhandled Escape on web and React Native Web. Native Android and iOS hardware Escape is not supported. |
| `closeOnOutsidePress` | boolean | `true` | Requests closure on an outside press without preventing its interaction or restoring trigger focus. |
| `initialFocus` | boolean | `false` | On committed opening (including initially open), focus the first focusable panel descendant, falling back to the panel without adding semantics. False leaves focus unchanged. Native moves accessible/input focus where supported. |
| `restoreFocus` | boolean | `true` | After committed trigger, Escape, action or Back closure, restore focus only if still inside the panel and the trigger is connected and focusable. Never steal outside focus, restore after outside press, or restore for unsolicited prop closure. |
| `side` | 'top' \| 'right' \| 'bottom' \| 'left' | `bottom` | Requested physical side; actual placement may flip. Recompute for trigger/panel size, viewport/safe-area, scrolling and orientation changes. |
| `align` | 'start' \| 'center' \| 'end' | `center` | Cross-axis alignment. On top/bottom, start/end follow inline direction (RTL reverses them); on left/right they mean top/bottom. |
| `flip` | boolean | `true` | Try the opposite side when the requested side overflows the available viewport/safe area; flip only if it reduces main-axis overflow. Ties keep the requested side. Runs before shift. |
| `shift` | boolean | `true` | After flip, translate within available viewport/safe-area bounds to reduce overflow. Constrain oversized panels to that region regardless of collision flags; flags never change requested props. |

**Events**

| DOM | React | Angular | React Native | Detail | Description |
| --- | --- | --- | --- | --- | --- |
| `cosm-open-change` | `onOpenChange` | `(openChange)` | `onOpenChange` | `PopoverOpenChangeDetail` | Proposes visibility changes by trigger, hover or focus, or closure by Escape, outside press, panel action, close button or Android Back. Closing only is cancelable, synchronously via the web event or detail.preventDefault(); native uses detail.preventDefault(). Not a committed-state notification. (cancelable) |

**Slots**

| Name | Description |
| --- | --- |
| `trigger` | Consumer-supplied accessible trigger; its appearance and label belong to the consumer. Native accepts content or a render function receiving onPress, ref and accessibilityState for composing an IconButton without nested buttons. |
| `(default)` | Consumer-supplied panel content and semantics. Native maps this content to children. |

**CSS parts**

| Name | Description |
| --- | --- |
| `trigger` | Trigger container. |
| `panel` | Non-modal anchored surface. |
| `body` | Scrollable consumer content. |
| `close` | Optional close IconButton. |
| `arrow` | Decorative pointer; follows panel colors. |

**CSS custom properties**

| Name | Description |
| --- | --- |
| `--cosm-popover-z-index` | Panel stacking level. |
| `--cosm-popover-padding` | Panel padding. |
| `--cosm-popover-radius` | Panel corner radius. |
| `--cosm-popover-shadow` | Panel shadow. |

**Keyboard**

| Keys | Action |
| --- | --- |
| `Enter`, `Space` | The focused trigger activates once and toggles open. |
| `Escape` | On web and React Native Web, requests close when open and closeOnEscape is true, unless a child already handled the key. |
| `Tab`, `Shift+Tab` | Moves focus normally without a focus trap or automatic dismissal. |
| `Android Back` | Requests close while open on Android only. |

### `listbox` (`<cosm-listbox>`)

Selects one or more values from a named vertical collection, with groups, descriptions, icons and independent keyboard focus.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | string | Required | Required nonempty accessible label, visible unless labelHidden is true. |
| `labelHidden` | boolean | `false` | Visually hides the label without removing its accessible name. |
| `items` | ListboxItems | Required | Readonly collection of options or named groups. Options have globally unique nonempty value and label strings, optional description, decorative IconDefinition and disabled. Groups have a nonempty label and options array. |
| `selectionMode` | 'single' \| 'multiple' | `single` | Single permits at most one selected value; multiple toggles each activation. |
| `selectedValues` | ListboxValues | — | Controlled selected values, including an empty array. Activation only proposes changes until the owner updates this prop. Missing collection values are retained, not automatically selected or removed. |
| `defaultSelectedValues` | ListboxValues | — | Initial autonomous selected values (empty by default). Later changes do not reset selection. |
| `variant` | 'plain' \| 'outlined' | `plain` | Plain composes inside a panel; outlined adds a standalone container boundary. |
| `size` | 'sm' \| 'md' \| 'lg' \| number | `md` | Semantic size or a positive finite minimum option height in CSS pixels/native logical units. Content may grow; native touch targets remain at least 44. |
| `disabled` | boolean | `false` | Prevents interaction and removes the list from keyboard navigation. |
| `readOnly` | boolean | `false` | Allows exploring options without proposing or committing selection changes. |
| `locale` | string | — | BCP 47 locale for typeahead. Web inherits the nearest language; native uses the runtime locale when omitted. Invalid locale identifiers are rejected. |

**Events**

| DOM | React | Angular | React Native | Detail | Description |
| --- | --- | --- | --- | --- | --- |
| `cosm-selection-change` | `onSelectionChange` | `(selectionChange)` | `onSelectionChange` | `ListboxSelectionChangeDetail` | Proposes the next selectedValues for an enabled activation. Autonomous selection commits; controlled selection waits for the owner. Arrows and typeahead never select. |

**CSS parts**

| Name | Description |
| --- | --- |
| `base` | Outer container. |
| `label` | Visible or visually hidden accessible label. |
| `list` | Scrollable listbox. |
| `group` | Named option group. |
| `group-label` | Noninteractive group heading. |
| `option` | Selectable row; selected, disabled and active states are exposed on the row. |
| `icon` | Decorative option icon. |
| `content` | Text content wrapper. |
| `option-label` | Primary option text. |
| `description` | Optional supporting text. |
| `indicator` | Decorative selected-state indicator. |

**CSS custom properties**

| Name | Description |
| --- | --- |
| `--cosm-listbox-background` | Container background. |
| `--cosm-listbox-color` | Primary foreground. |
| `--cosm-listbox-border` | Outlined container border color. |
| `--cosm-listbox-radius` | Container and option corner radius. |
| `--cosm-listbox-option-height` | Minimum option height. |
| `--cosm-listbox-option-padding` | Option padding. |
| `--cosm-listbox-gap` | Space between icon, content and selection indicator. |
| `--cosm-listbox-font-size` | Primary option text size. |
| `--cosm-listbox-description-color` | Supporting text color. |
| `--cosm-listbox-selected-background` | Selected option background. |
| `--cosm-listbox-selected-color` | Selected option foreground. |
| `--cosm-listbox-focus` | Visible keyboard focus outline color. |
| `--cosm-listbox-max-height` | Maximum scrollable list height. |

**Keyboard**

| Keys | Action |
| --- | --- |
| `Tab`, `Shift+Tab` | Enters or leaves the list as one Tab stop. |
| `ArrowDown`, `ArrowUp`, `Home`, `End` | Moves focus among enabled options without changing selection; stops at the ends. |
| `Enter`, `Space` | Selects the focused option; multiple mode toggles it. Read-only never changes selection. |
| `Printable characters` | Moves focus to a matching option using locale-aware typeahead without filtering. |

### `checkbox` (`<cosm-checkbox>`)

Selects an independent boolean value with accessible labeling and native form behavior on the web.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | string | Required | Required accessible name, visible unless hideLabel is true. |
| `hideLabel` | boolean | `false` | Visually hides the label while keeping it available to assistive technology. |
| `checked` | boolean | `false` | Controlled checked value when supplied, including false; activation proposes changes without self-committing. |
| `defaultChecked` | boolean | `false` | Initial autonomous checked value; later changes do not reset it. |
| `indeterminate` | boolean | `false` | Presentation-only mixed state. Autonomous activation clears it; controlled use leaves it to the owner. |
| `size` | 'sm' \| 'md' \| 'lg' \| number | `md` | Semantic visual-box size or positive finite number in CSS pixels on web and logical units on native. |
| `disabled` | boolean | `false` | Prevents user interaction and excludes the value from web form submission. |
| `required` | boolean | `false` | Exposes required semantics and participates in native web form validation. Native has no automatic validation. |
| `invalid` | boolean | `false` | Externally supplied invalid presentation state; web form validity remains based on required. |
| `helpText` | string | — | Optional consumer-localized supporting text associated with the checkbox. |
| `errorText` | string | — | Optional consumer-localized error description; a nonempty value also exposes invalid state. |
| `name` | string | — | Web form field name; React Native has no HTML form association. |
| `value` | string | `on` | Web form value submitted when checked and enabled; defaults to on. Angular Forms uses checked as its boolean value. |

**Events**

| DOM | React | Angular | React Native | Detail | Description |
| --- | --- | --- | --- | --- | --- |
| `cosm-checked-change` | `onCheckedChange` | `(checkedChange)` | `onCheckedChange` | `CheckboxCheckedChangeDetail` | Proposes the next checked value after enabled user activation; controlled state waits for the owner. |

**Slots**

| Name | Description |
| --- | --- |
| `(default)` | Optional noninteractive inline label content; links and buttons are not allowed. |

**CSS parts**

| Name | Description |
| --- | --- |
| `base` | The label and visual checkbox control. |
| `input` | The native checkbox input and web focus target. |
| `box` | The visible checkbox box and indicator. |
| `label` | Visible or visually hidden label text. |
| `help-text` | Supporting text associated with the checkbox. |
| `error-text` | Error description associated with the checkbox. |

**CSS custom properties**

| Name | Description |
| --- | --- |
| `--cosm-checkbox-size` | Visual box width and height. |
| `--cosm-checkbox-background` | Unchecked box background. |
| `--cosm-checkbox-checked-background` | Checked and mixed box background. |
| `--cosm-checkbox-color` | Checked indicator foreground. |
| `--cosm-checkbox-border` | Box boundary color. |
| `--cosm-checkbox-radius` | Box corner radius. |
| `--cosm-checkbox-focus` | Visible keyboard focus indicator color. |
| `--cosm-checkbox-gap` | Space between the box and label. |

**Keyboard**

| Keys | Action |
| --- | --- |
| `Tab`, `Shift+Tab` | Moves focus to or from the enabled checkbox. |
| `Space` | Toggles checked state and emits a checkedChange proposal. |

### `switch` (`<cosm-switch>`)

Toggles a binary setting immediately with a stable accessible name and form behavior on the web.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | string | Required | Required nonempty accessible name; remains stable in both states. |
| `hideLabel` | boolean | `false` | Visually hides the label while retaining its accessible name. |
| `checked` | boolean | `false` | Controlled checked value when supplied, including false; activation proposes changes without self-committing. |
| `defaultChecked` | boolean | `false` | Initial autonomous checked value; later changes do not reset it. |
| `size` | 'sm' \| 'md' \| 'lg' \| number | `md` | Web visual size preset or positive finite CSS-pixel size. Native uses system Switch sizing; numeric sizes do not scale it. |
| `disabled` | boolean | `false` | Prevents user interaction and excludes the value from web form submission. |
| `invalid` | boolean | `false` | Externally supplied invalid presentation. Does not change checked state or form validity; native uses danger colors without an equivalent system invalid trait. |
| `helpText` | string | — | Optional consumer-localized supporting text associated with the switch. |
| `name` | string | — | Web form field name; React Native has no HTML form association. |
| `value` | string | `on` | Web form value submitted when checked and enabled; defaults to on. Angular Forms uses checked as its boolean value. |

**Events**

| DOM | React | Angular | React Native | Detail | Description |
| --- | --- | --- | --- | --- | --- |
| `cosm-checked-change` | `onCheckedChange` | `(checkedChange)` | `onCheckedChange` | `SwitchCheckedChangeDetail` | Proposes the next checked value after enabled user activation; controlled state waits for the owner. |

**CSS parts**

| Name | Description |
| --- | --- |
| `base` | Label, control and supporting text layout. |
| `input` | Native checkbox input and web focus target. |
| `track` | Visible switch track. |
| `thumb` | Visible switch thumb. |
| `label` | Visible or visually hidden label text. |
| `help-text` | Supporting text associated with the switch. |

**CSS custom properties**

| Name | Description |
| --- | --- |
| `--cosm-switch-width` | Track width. |
| `--cosm-switch-height` | Track height. |
| `--cosm-switch-thumb-size` | Thumb diameter. |
| `--cosm-switch-track-background` | Unchecked track background. |
| `--cosm-switch-checked-track-background` | Checked track background. |
| `--cosm-switch-thumb-background` | Thumb background. |
| `--cosm-switch-border` | Unchecked track boundary color. |
| `--cosm-switch-radius` | Track corner radius. |
| `--cosm-switch-gap` | Space between the switch and label. |
| `--cosm-switch-focus` | Visible keyboard focus indicator color. |

**Keyboard**

| Keys | Action |
| --- | --- |
| `Tab`, `Shift+Tab` | Moves focus to or from the enabled switch. |
| `Space` | Toggles checked state and emits a checkedChange proposal. |

### `badge` (`<cosm-badge>`)

Displays a noninteractive status or category label, or caller-formatted count, with an optional decorative leading icon.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | 'soft' \| 'solid' \| 'outline' | `soft` | Visual treatment of the static label. |
| `tone` | 'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger' | `neutral` | Semantic color intent of the static label. |
| `size` | 'sm' \| 'md' \| 'lg' | `md` | Semantic label size. |
| `startIcon` | IconDefinition | — | Optional structured decorative icon before the label. |

**Events**

No events.

**Slots**

| Name | Description |
| --- | --- |
| `(default)` | Label or caller-formatted count text. |

**CSS parts**

| Name | Description |
| --- | --- |
| `base` | Rounded label container. |
| `label` | Label or caller-formatted count text. |
| `icon` | Optional decorative leading icon wrapper. |

**CSS custom properties**

| Name | Description |
| --- | --- |
| `--cosm-badge-background` | Badge background color. |
| `--cosm-badge-color` | Badge text and icon color. |
| `--cosm-badge-border` | Badge border color. |
| `--cosm-badge-padding-inline` | Badge inline padding. |
| `--cosm-badge-padding-block` | Badge block padding. |
| `--cosm-badge-gap` | Space between the icon and label. |
| `--cosm-badge-font-family` | Badge label font family. |
| `--cosm-badge-font-size` | Badge label font size. |
| `--cosm-badge-font-weight` | Badge label font weight. |
| `--cosm-badge-line-height` | Badge label line height. |
| `--cosm-badge-radius` | Badge corner radius. |

### `calendar` (`<cosm-calendar>`)

Selects one Gregorian date from an inline, localized calendar with keyboard navigation and optional bounds. Month and year can be selected directly.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | string | — | Controlled selected date in YYYY-MM-DD format; when supplied, selection proposals wait for the owner to update this value. |
| `defaultValue` | string | — | Initial autonomous selected date in YYYY-MM-DD format; later changes do not reset selection. |
| `min` | string | — | Earliest selectable date in YYYY-MM-DD format, inclusive. |
| `max` | string | — | Latest selectable date in YYYY-MM-DD format, inclusive. |
| `locale` | string | — | BCP 47 locale for month and weekday names, week start, and text direction; defaults to the environment locale. Invalid locale identifiers are rejected. |
| `disabled` | boolean | `false` | Disables date selection and calendar navigation. |

**Events**

| DOM | React | Angular | React Native | Detail | Description |
| --- | --- | --- | --- | --- | --- |
| `cosm-change` | `onChange` | `(valueChange)` | `onValueChange` | `CalendarChangeDetail` | Proposes an enabled selected date as a YYYY-MM-DD value; autonomous selection commits and controlled selection waits for the owner. |

**CSS parts**

| Name | Description |
| --- | --- |
| `base` | Calendar root. |
| `header` | Month heading and navigation controls. |
| `previous` | Previous-month navigation button. |
| `heading` | Localized month and year heading. |
| `next` | Next-month navigation button. |
| `weekday` | Localized weekday heading. |
| `grid` | Seven-column date grid. |
| `day` | Date button, including adjacent-month dates. |
| `month-trigger` | Button that opens direct month selection. |
| `year-trigger` | Button that opens direct year selection. |
| `month-option` | Month choice in the month selection view. |
| `year-option` | Year choice in the year selection view. |

**CSS custom properties**

| Name | Description |
| --- | --- |
| `--cosm-calendar-background` | Calendar surface background. |
| `--cosm-calendar-color` | Primary calendar text color. |
| `--cosm-calendar-muted-color` | Adjacent-month and weekday text color. |
| `--cosm-calendar-selected-background` | Selected-date background. |
| `--cosm-calendar-selected-color` | Selected-date text color. |
| `--cosm-calendar-day-size` | Minimum date target dimensions. |
| `--cosm-calendar-gap` | Space between date targets. |
| `--cosm-calendar-radius` | Date target corner radius. |
| `--cosm-calendar-focus` | Visible keyboard focus indicator color. |
| `--cosm-calendar-today-border` | Non-color-only today marker. |

**Keyboard**

| Keys | Action |
| --- | --- |
| `Tab`, `Shift+Tab` | Moves between the navigation controls and one active date. |
| `ArrowLeft`, `ArrowRight` | Moves the active date by one day; direction follows the visual RTL/LTR order. |
| `ArrowUp`, `ArrowDown` | Moves the active date by one week. |
| `Home`, `End` | Moves to the first or last day of the localized week. |
| `PageUp`, `PageDown` | Moves the active date by one month. |
| `Shift+PageUp`, `Shift+PageDown` | Moves the active date by one year. |
| `Enter`, `Space` | Proposes selection of the active enabled date. |

### `textarea` (`<cosm-textarea>`)

Accepts multiline plain text with an accessible label, optional help and error text, and native form behavior on the web.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | string | Required | Accessible name for the editable control. It is rendered above the control unless visually hidden. |
| `labelHidden` | boolean | `false` | Visually hides the label while keeping it available to assistive technology. |
| `value` | string | — | Current text. When bound, edits are proposals and the component waits for the owner to supply the accepted value. |
| `defaultValue` | string | `` | Initial value for autonomous use. Web form reset restores this value; it does not control subsequent edits. |
| `rows` | number | `4` | Visible line count of the multiline editor. It is independent of the visual size. |
| `variant` | 'outlined' \| 'filled' | `outlined` | Visual treatment of the editable control. |
| `size` | 'sm' \| 'md' \| 'lg' | `md` | Visual size of the editable control, independent of rows. |
| `placeholder` | string | — | Short input hint; it never replaces the accessible label. |
| `helpText` | string | — | Optional supporting text associated with the editable control. |
| `error` | string | — | Optional externally supplied error text associated with the editable control. |
| `invalid` | boolean | `false` | External invalid state, independent of browser constraints or consumer business validation. |
| `required` | boolean | `false` | Exposes required semantics. On web, participates in native HTML constraint validation. |
| `disabled` | boolean | `false` | Disables editing and interaction. On web, follows disabled fieldsets and excludes the value from form submission. |
| `readOnly` | boolean | `false` | Prevents editing while remaining focusable and form-submittable on web; distinct from disabled. |
| `maxLength` | number | — | Maximum number of characters. Web uses native HTML length constraints and native applies supported input limits. |
| `name` | string | — | Form field name on web. React Native has no HTML form association or name-based submission. |

**Events**

| DOM | React | Angular | React Native | Detail | Description |
| --- | --- | --- | --- | --- | --- |
| `cosm-change` | `onChange` | `(valueChange)` | `onValueChange` | `TextareaChangeDetail` | Proposes the current text after each user edit; this is not a blur/commit event. |

**CSS parts**

| Name | Description |
| --- | --- |
| `label` | Accessible label above the control. |
| `control` | Visual control containing the editable textarea. |
| `textarea` | The native multiline editable textarea. |
| `help` | Supporting text associated with the editable textarea. |
| `error` | External or native-constraint error text associated with the editable textarea. |

**CSS custom properties**

| Name | Description |
| --- | --- |
| `--cosm-textarea-background` | Editable control background. |
| `--cosm-textarea-color` | Editable text color. |
| `--cosm-textarea-placeholder` | Placeholder text color. |
| `--cosm-textarea-border` | Editable control boundary color. |
| `--cosm-textarea-focus` | Visible focus indicator color. |
| `--cosm-textarea-radius` | Editable control corner radius. |

**Keyboard**

| Keys | Action |
| --- | --- |
| `Tab`, `Shift+Tab` | Moves focus to or from the enabled editable control. |
| `Enter` | Inserts a newline in the editable text. |

### `radio-group` (`<cosm-radio-group>`)

Selects one option from a labeled collection, with optional selection and native Web form behavior.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | string | Required | Required visible accessible name for the group. |
| `options` | RadioGroupOptions | Required | Readonly flat options with unique nonempty values and labels, optional descriptions and disabled states. |
| `value` | RadioGroupValue | — | Controlled selected value; null means no selection, and a supplied null remains controlled. |
| `defaultValue` | RadioGroupValue | — | Initial autonomous selection; null by default. |
| `orientation` | 'vertical' \| 'horizontal' | `vertical` | Vertical list or wrapping horizontal options. |
| `disabled` | boolean | `false` | Prevents interaction and excludes the value from Web form submission. |
| `required` | boolean | `false` | Requires a selection in Web form validation; Native exposes descriptive semantics. |
| `invalid` | boolean | `false` | Externally supplied invalid presentation state. |
| `helpText` | string | — | Optional supporting text associated with the group. |
| `errorText` | string | — | Optional consumer-localized error text; a nonempty value also exposes invalid state. |
| `name` | string | — | Web form field name; React Native has no HTML form association. |

**Events**

| DOM | React | Angular | React Native | Detail | Description |
| --- | --- | --- | --- | --- | --- |
| `cosm-change` | `onChange` | `(valueChange)` | `onValueChange` | `RadioGroupChangeDetail` | Proposes a selection after enabled user activation; autonomous state commits and controlled state waits for the owner. |

**CSS parts**

| Name | Description |
| --- | --- |
| `base` | Group wrapper and accessible fieldset. |
| `label` | Visible group label. |
| `options` | Option collection. |
| `option` | Selectable option row. |
| `input` | Native radio input and Web focus target. |
| `control` | Visible circular radio boundary. |
| `indicator` | Selected radio dot. |
| `option-label` | Primary option text. |
| `description` | Optional option description. |
| `help-text` | Supporting text associated with the group. |
| `error-text` | Error description associated with the group. |

**CSS custom properties**

| Name | Description |
| --- | --- |
| `--cosm-radio-group-gap` | Space between option rows. |
| `--cosm-radio-group-option-gap` | Space between the radio control and option content. |
| `--cosm-radio-group-control-size` | Diameter of the visible radio control. |
| `--cosm-radio-group-border` | Unchecked radio boundary color. |
| `--cosm-radio-group-selected-border` | Selected radio boundary color. |
| `--cosm-radio-group-indicator` | Selected radio dot color. |
| `--cosm-radio-group-focus` | Visible keyboard focus indicator color. |

**Keyboard**

| Keys | Action |
| --- | --- |
| `Tab`, `Shift+Tab` | Enters or leaves the group as one tab stop. |
| `Space` | Selects the focused enabled option. |
| `ArrowRight`, `ArrowDown`, `ArrowLeft`, `ArrowUp` | Moves focus and selection through enabled options with wrapping. |


## Rules for AI assistants

- Use Cosmos components before writing custom UI; check `list_components` / the component status page for what exists.
- Style with Cosmos tokens: `var(--cosm-*)` in CSS or the Tailwind theme utilities (`bg-primary`, `text-fg-muted`, `rounded-md`). Never hard-code colors.
- Set the theme and mode with `data-theme` and `data-mode` on the root element (or `CosmosThemeProvider` on React Native).
- Keep accessibility: give icon-only buttons a `label`, never rely on color alone, keep keyboard support.
- Never render untrusted HTML (`innerHTML`, `dangerouslySetInnerHTML`) and never build class names from user input.

<!-- generated:end -->
