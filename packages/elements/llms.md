# @joralvmel/cosmos-elements

Framework-agnostic Web Components (Lit) of Cosmos UI. Use them in plain HTML or any framework; React and Angular users should prefer `@joralvmel/cosmos-react` / `@joralvmel/cosmos-angular`.

Checkbox and Text Field use themed hover borders on enabled valid controls; checked/mixed
Checkbox uses `primary-hover`. Text Field adds `primary-subtle` while its input or actions have
focus. Existing component background/border/focus hooks retain priority over theme defaults.
Disabled controls do not react to hover; invalid hover borders retain danger. No new props or tokens.

<!-- generated:start (npm run llms, do not edit this block by hand) -->

## Setup: HTML / CDN

**Load tokens and components from a CDN** (`index.html`)

```html
<!doctype html>
<html lang="en" data-theme="cosmos" data-mode="system">
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@joralvmel/cosmos-tokens/dist/tokens.css" />
    <script type="module" src="https://esm.sh/@joralvmel/cosmos-elements/button"></script>
  </head>
  <body>
    <cosm-button variant="soft">Save</cosm-button>
    <script type="module">
      document.querySelector('cosm-button').addEventListener('cosm-press', event => {
        console.log(event.detail.source);
      });
    </script>
  </body>
</html>
```

- With a bundler, `npm install @joralvmel/cosmos-elements @joralvmel/cosmos-tokens` and import `@joralvmel/cosmos-elements/<component>`.
- DOM events are `cosm-*` CustomEvents that bubble and cross shadow roots.

Guide: https://joralvmel.github.io/cosmos-ui/guides/html-cdn/

## Components

Every component of this package (status of planned ones: https://joralvmel.github.io/cosmos-ui/components/status/).

### `<cosm-button>`

Triggers an action or submits a form.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | 'solid' \| 'soft' \| 'outline' \| 'ghost' | `solid` | Visual emphasis, from highest (solid) to lowest (ghost). |
| `tone` | 'primary' \| 'neutral' \| 'danger' | `primary` | Color role. Use danger for destructive actions. |
| `size` | 'sm' \| 'md' \| 'lg' | `md` | Control height and padding. |
| `disabled` | boolean | `false` | Prevents interaction and removes the button from the tab order. |
| `loading` | boolean | `false` | Shows a spinner, sets aria-busy and ignores presses while keeping focus. |
| `fullWidth` (`full-width`) | boolean | `false` | Stretches the button to the width of its container. |
| `type` | 'button' \| 'submit' \| 'reset' | `button` | Form behavior of the button. |
| `label` | string | — | Accessible name when the visible content is not descriptive (icon-only buttons). |

Events: `cosm-press` → `ButtonPressDetail`.

```html
<cosm-button>Button</cosm-button>

<script type="module">
  import '@joralvmel/cosmos-elements/button';

  const element = document.querySelector('cosm-button');
  element.addEventListener('cosm-press', event => console.log(event.detail));
</script>
```
### `<cosm-icon>`

Renders a structured SVG icon. Decorative icons are hidden from assistive technology; informative icons require a text label.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | IconDefinition | Required | Structured icon definition, commonly imported from @joralvmel/cosmos-icons. |
| `size` | 'sm' \| 'md' \| 'lg' \| number | `md` | Semantic size (16, 20 or 24) or a positive finite number in pixels / native units. |
| `stroke` | string | `currentColor` | Stroke paint; currentColor inherits on web and resolves to the theme foreground on native. |
| `fill` | string | `none` | Root fill paint. Explicit node fills take precedence. |
| `strokeWidth` (`stroke-width`) | number | `2` | Finite nonnegative stroke width in SVG viewBox units. |
| `label` | string | — | Accessible name required when decorative is false. |
| `decorative` | boolean | `true` | Hides the icon from assistive technology when true. |

Events: none.

```html
<cosm-icon></cosm-icon>

<script type="module">
  import '@joralvmel/cosmos-elements/icon';
  import { house } from '@joralvmel/cosmos-icons/house';

  const element = document.querySelector('cosm-icon');
  element.icon = house;
</script>
```
### `<cosm-text-field>`

Accepts a single line of text with an accessible label, optional help and error text, and native form validation on the web.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | string | Required | Accessible name for the editable control. It is rendered above the control unless visually hidden. |
| `labelHidden` (`label-hidden`) | boolean | `false` | Visually hides the label while keeping it available to assistive technology. |
| `value` | string | — | Current text. When bound, edits are proposals and the component waits for the owner to supply the accepted value. |
| `defaultValue` (`default-value`) | string | `` | Initial value for autonomous use. Web form reset restores this value; it does not control subsequent edits. |
| `type` | 'text' \| 'email' \| 'password' \| 'tel' \| 'url' \| 'search' | `text` | Single-line input type. Native maps it to supported keyboard, autofill and secure-entry behavior. |
| `variant` | 'outlined' \| 'filled' | `outlined` | Visual treatment of the editable control. |
| `size` | 'sm' \| 'md' \| 'lg' \| number | `md` | Semantic size or a positive finite minimum editable-control height in CSS pixels on web and logical units on native. |
| `placeholder` | string | — | Short input hint; it never replaces the accessible label. |
| `helpText` (`help-text`) | string | — | Optional supporting text associated with the editable control. |
| `error` | string | — | Optional externally supplied error text associated with the editable control. |
| `invalid` | boolean | `false` | External invalid state, independent of browser constraints or consumer business validation. |
| `required` | boolean | `false` | Exposes required semantics. On web, participates in native HTML constraint validation. |
| `disabled` | boolean | `false` | Disables editing and interaction. On web, follows disabled fieldsets and excludes the value from form submission. |
| `readOnly` (`read-only`) | boolean | `false` | Prevents editing while remaining focusable and form-submittable on web; distinct from disabled. |
| `minLength` (`min-length`) | number | — | Minimum number of characters. Web uses native HTML validity; native business validation remains the consumer’s responsibility. |
| `maxLength` (`max-length`) | number | — | Maximum number of characters. Web uses native HTML validity and native applies supported input limits. |
| `pattern` | string | — | Web-only HTML pattern constraint. Native does not emulate HTML regular-expression validation. |
| `name` | string | — | Form field name on web. React Native has no HTML form association or name-based submission. |
| `autoComplete` (`auto-complete`) | string | — | Consumer-provided completion/autofill hint, mapped to attributes supported by each platform. |
| `inputMode` (`input-mode`) | 'none' \| 'text' \| 'decimal' \| 'numeric' \| 'tel' \| 'search' \| 'email' \| 'url' | — | Input or keyboard hint (none, text, decimal, numeric, tel, search, email or url); it does not add numeric or multiline field behavior. |
| `startIcon` (`start-icon`) | IconDefinition | — | Optional structured decorative icon before the editable text. |
| `endIcon` (`end-icon`) | IconDefinition | — | Optional structured decorative icon after the editable text. |
| `iconFocusScope` (`icon-focus-scope`) | 'control' \| 'input' | `control` | When configured icon focus colors apply: control includes the input and clear/reveal buttons; input includes only the editable input. Does not change icons without a focus-color override. |
| `prefix` | string | — | Optional non-interactive text decoration before the editable text. |
| `suffix` | string | — | Optional non-interactive text decoration after the editable text. |
| `clearable` | boolean | `false` | Shows a clear action for non-empty editable fields. Supply clearLabel when enabled. |
| `clearLabel` (`clear-label`) | string | — | Consumer-supplied localized accessible name for the clear action. |
| `passwordReveal` (`password-reveal`) | boolean | `false` | Opts into a reveal action for password fields. Supply both revealPasswordLabel and hidePasswordLabel when enabled. |
| `revealPasswordLabel` (`reveal-password-label`) | string | — | Consumer-supplied localized accessible name while the password is concealed. |
| `hidePasswordLabel` (`hide-password-label`) | string | — | Consumer-supplied localized accessible name while the password is revealed. |

Events: `cosm-change` → `TextFieldChangeDetail`, `cosm-submit` → `TextFieldSubmitDetail`.

```html
<cosm-text-field label="TextField"></cosm-text-field>

<script type="module">
  import '@joralvmel/cosmos-elements/text-field';
  import { search } from '@joralvmel/cosmos-icons/search';

  const element = document.querySelector('cosm-text-field');
  element.startIcon = search;
  element.endIcon = search;
  element.addEventListener('cosm-change', event => console.log(event.detail));
  element.addEventListener('cosm-submit', event => console.log(event.detail));
</script>
```
### `<cosm-icon-button>`

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
| `defaultPressed` (`default-pressed`) | boolean | `false` | Initial toggle state when pressed is not supplied; it does not control later changes. |

Events: `cosm-press` → `IconButtonPressDetail`, `cosm-pressed-change` → `IconButtonPressedChangeDetail`.

```html
<cosm-icon-button label="IconButton"><cosm-icon></cosm-icon></cosm-icon-button>

<script type="module">
  import '@joralvmel/cosmos-elements/icon';
  import { heart } from '@joralvmel/cosmos-icons/heart';
  import '@joralvmel/cosmos-elements/icon-button';

  const element = document.querySelector('cosm-icon-button');
  element.addEventListener('cosm-press', event => console.log(event.detail));
  element.addEventListener('cosm-pressed-change', event => console.log(event.detail));

  const childElement = document.querySelector('cosm-icon');
  childElement.icon = heart;
</script>
```
### `<cosm-popover>`

Non-modal content anchored to a consumer trigger, with cancelable close requests and no imposed panel semantics.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | boolean | `false` | Committed visibility. Supplying this prop, including false, controls state; its metadata default does not establish a binding. |
| `defaultOpen` (`default-open`) | boolean | `false` | Initial autonomous visibility only; ignored when open is supplied. Later updates do not reset state. |
| `triggerMode` (`trigger-mode`) | 'press' \| 'hover' | `press` | Hover adds pointer and keyboard-focus opening on web and React Native Web, while keeping press activation. Android/iOS use press. Does not change panel semantics. |
| `closable` | boolean | `false` | Shows a built-in IconButton with an X. Requests a cancelable close with reason close-button. |
| `closeLabel` (`close-label`) | string | `Close` | Localized accessible name of the close button. Must be non-empty when closable is true. |
| `gap` | number | `8` | Non-negative finite distance from trigger to panel, or to the arrow tip. CSS pixels on web, logical units on native. Viewport/safe-area collision handling takes priority. |
| `arrow` | boolean | `false` | Shows a decorative triangular pointer (16 wide, 8 deep), following the actual side, panel background and border. Hidden if it cannot point to the trigger without crossing a corner or viewport edge. |
| `closeOnEscape` (`close-on-escape`) | boolean | `true` | Requests closure on unhandled Escape on web and React Native Web. Native Android and iOS hardware Escape is not supported. |
| `closeOnOutsidePress` (`close-on-outside-press`) | boolean | `true` | Requests closure on an outside press without preventing its interaction or restoring trigger focus. |
| `initialFocus` (`initial-focus`) | boolean | `false` | On committed opening (including initially open), focus the first focusable panel descendant, falling back to the panel without adding semantics. False leaves focus unchanged. Native moves accessible/input focus where supported. |
| `restoreFocus` (`restore-focus`) | boolean | `true` | After committed trigger, Escape, action or Back closure, restore focus only if still inside the panel and the trigger is connected and focusable. Never steal outside focus, restore after outside press, or restore for unsolicited prop closure. |
| `side` | 'top' \| 'right' \| 'bottom' \| 'left' | `bottom` | Requested physical side; actual placement may flip. Recompute for trigger/panel size, viewport/safe-area, scrolling and orientation changes. |
| `align` | 'start' \| 'center' \| 'end' | `center` | Cross-axis alignment. On top/bottom, start/end follow inline direction (RTL reverses them); on left/right they mean top/bottom. |
| `flip` | boolean | `true` | Try the opposite side when the requested side overflows the available viewport/safe area; flip only if it reduces main-axis overflow. Ties keep the requested side. Runs before shift. |
| `shift` | boolean | `true` | After flip, translate within available viewport/safe-area bounds to reduce overflow. Constrain oversized panels to that region regardless of collision flags; flags never change requested props. |

Events: `cosm-open-change` → `PopoverOpenChangeDetail`.

```html
<cosm-popover><cosm-icon-button slot="trigger" label="Details" variant="ghost" tone="neutral"><cosm-icon></cosm-icon></cosm-icon-button>Popover</cosm-popover>

<script type="module">
  import '@joralvmel/cosmos-elements/popover';
  import { info } from '@joralvmel/cosmos-icons/info';
  document.querySelector('cosm-popover [slot="trigger"] cosm-icon').icon = info;

  const element = document.querySelector('cosm-popover');
  element.addEventListener('cosm-open-change', event => console.log(event.detail));
</script>
```
### `<cosm-listbox>`

Selects one or more values from a named vertical collection, with groups, descriptions, icons and independent keyboard focus.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | string | Required | Required nonempty accessible label, visible unless labelHidden is true. |
| `labelHidden` (`label-hidden`) | boolean | `false` | Visually hides the label without removing its accessible name. |
| `items` | ListboxItems | Required | Readonly collection of options or named groups. Options have globally unique nonempty value and label strings, optional description, decorative IconDefinition and disabled. Groups have a nonempty label and options array. |
| `selectionMode` (`selection-mode`) | 'single' \| 'multiple' | `single` | Single permits at most one selected value; multiple toggles each activation. |
| `selectedValues` (`selected-values`) | ListboxValues | — | Controlled selected values, including an empty array. Activation only proposes changes until the owner updates this prop. Missing collection values are retained, not automatically selected or removed. |
| `defaultSelectedValues` (`default-selected-values`) | ListboxValues | — | Initial autonomous selected values (empty by default). Later changes do not reset selection. |
| `variant` | 'plain' \| 'outlined' | `plain` | Plain composes inside a panel; outlined adds a standalone container boundary. |
| `size` | 'sm' \| 'md' \| 'lg' \| number | `md` | Semantic size or a positive finite minimum option height in CSS pixels/native logical units. Content may grow; native touch targets remain at least 44. |
| `disabled` | boolean | `false` | Prevents interaction and removes the list from keyboard navigation. |
| `readOnly` (`read-only`) | boolean | `false` | Allows exploring options without proposing or committing selection changes. |
| `locale` | string | — | BCP 47 locale for typeahead. Web inherits the nearest language; native uses the runtime locale when omitted. Invalid locale identifiers are rejected. |

Events: `cosm-selection-change` → `ListboxSelectionChangeDetail`.

```html
<cosm-listbox label="Listbox"></cosm-listbox>

<script type="module">
  import '@joralvmel/cosmos-elements/listbox';
  const grouped = [{"label":"Fruit","options":[{"value":"apple","label":"Apple"},{"value":"cherry","label":"Cherry","description":"Seasonal"}]},{"label":"Vegetables","options":[{"value":"carrot","label":"Carrot"},{"value":"broccoli","label":"Broccoli","disabled":true}]}];
  const empty = [];

  const element = document.querySelector('cosm-listbox');
  element.items = grouped;
  element.defaultSelectedValues = empty;
  element.addEventListener('cosm-selection-change', event => console.log(event.detail));
</script>
```
### `<cosm-checkbox>`

Selects an independent boolean value with accessible labeling and native form behavior on the web.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | string | Required | Required accessible name, visible unless hideLabel is true. |
| `hideLabel` (`hide-label`) | boolean | `false` | Visually hides the label while keeping it available to assistive technology. |
| `checked` | boolean | `false` | Controlled checked value when supplied, including false; activation proposes changes without self-committing. |
| `defaultChecked` (`default-checked`) | boolean | `false` | Initial autonomous checked value; later changes do not reset it. |
| `indeterminate` | boolean | `false` | Presentation-only mixed state. Autonomous activation clears it; controlled use leaves it to the owner. |
| `size` | 'sm' \| 'md' \| 'lg' \| number | `md` | Semantic visual-box size or positive finite number in CSS pixels on web and logical units on native. |
| `disabled` | boolean | `false` | Prevents user interaction and excludes the value from web form submission. |
| `required` | boolean | `false` | Exposes required semantics and participates in native web form validation. Native has no automatic validation. |
| `invalid` | boolean | `false` | Externally supplied invalid presentation state; web form validity remains based on required. |
| `helpText` (`help-text`) | string | — | Optional consumer-localized supporting text associated with the checkbox. |
| `errorText` (`error-text`) | string | — | Optional consumer-localized error description; a nonempty value also exposes invalid state. |
| `name` | string | — | Web form field name; React Native has no HTML form association. |
| `value` | string | `on` | Web form value submitted when checked and enabled; defaults to on. Angular Forms uses checked as its boolean value. |

Events: `cosm-checked-change` → `CheckboxCheckedChangeDetail`.

```html
<cosm-checkbox label="Checkbox">Checkbox</cosm-checkbox>

<script type="module">
  import '@joralvmel/cosmos-elements/checkbox';

  const element = document.querySelector('cosm-checkbox');
  element.addEventListener('cosm-checked-change', event => console.log(event.detail));
</script>
```
### `<cosm-switch>`

Toggles a binary setting immediately with a stable accessible name and form behavior on the web.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | string | Required | Required nonempty accessible name; remains stable in both states. |
| `hideLabel` (`hide-label`) | boolean | `false` | Visually hides the label while retaining its accessible name. |
| `checked` | boolean | `false` | Controlled checked value when supplied, including false; activation proposes changes without self-committing. |
| `defaultChecked` (`default-checked`) | boolean | `false` | Initial autonomous checked value; later changes do not reset it. |
| `size` | 'sm' \| 'md' \| 'lg' \| number | `md` | Web visual size preset or positive finite CSS-pixel size. Native uses system Switch sizing; numeric sizes do not scale it. |
| `disabled` | boolean | `false` | Prevents user interaction and excludes the value from web form submission. |
| `invalid` | boolean | `false` | Externally supplied invalid presentation. Does not change checked state or form validity; native uses danger colors without an equivalent system invalid trait. |
| `helpText` (`help-text`) | string | — | Optional consumer-localized supporting text associated with the switch. |
| `name` | string | — | Web form field name; React Native has no HTML form association. |
| `value` | string | `on` | Web form value submitted when checked and enabled; defaults to on. Angular Forms uses checked as its boolean value. |

Events: `cosm-checked-change` → `SwitchCheckedChangeDetail`.

```html
<cosm-switch label="Switch"></cosm-switch>

<script type="module">
  import '@joralvmel/cosmos-elements/switch';

  const element = document.querySelector('cosm-switch');
  element.addEventListener('cosm-checked-change', event => console.log(event.detail));
</script>
```
### `<cosm-badge>`

Displays a noninteractive status or category label, or caller-formatted count, with an optional decorative leading icon.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | 'soft' \| 'solid' \| 'outline' | `soft` | Visual treatment of the static label. |
| `tone` | 'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger' | `neutral` | Semantic color intent of the static label. |
| `size` | 'sm' \| 'md' \| 'lg' | `md` | Semantic label size. |
| `startIcon` (`start-icon`) | IconDefinition | — | Optional structured decorative icon before the label. |

Events: none.

```html
<cosm-badge>Badge</cosm-badge>

<script type="module">
  import '@joralvmel/cosmos-elements/badge';
  import { heart } from '@joralvmel/cosmos-icons/heart';

  const element = document.querySelector('cosm-badge');
  element.startIcon = heart;
</script>
```
### `<cosm-calendar>`

Selects one Gregorian date from an inline, localized calendar with keyboard navigation and optional bounds. Month and year can be selected directly.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | string | — | Controlled selected date in YYYY-MM-DD format; when supplied, selection proposals wait for the owner to update this value. |
| `defaultValue` (`default-value`) | string | — | Initial autonomous selected date in YYYY-MM-DD format; later changes do not reset selection. |
| `min` | string | — | Earliest selectable date in YYYY-MM-DD format, inclusive. |
| `max` | string | — | Latest selectable date in YYYY-MM-DD format, inclusive. |
| `locale` | string | — | BCP 47 locale for month and weekday names, week start, and text direction; defaults to the environment locale. Invalid locale identifiers are rejected. |
| `disabled` | boolean | `false` | Disables date selection and calendar navigation. |

Events: `cosm-change` → `CalendarChangeDetail`.

```html
<cosm-calendar></cosm-calendar>

<script type="module">
  import '@joralvmel/cosmos-elements/calendar';

  const element = document.querySelector('cosm-calendar');
  element.addEventListener('cosm-change', event => console.log(event.detail));
</script>
```
### `<cosm-textarea>`

Accepts multiline plain text with an accessible label, optional help and error text, and native form behavior on the web.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | string | Required | Accessible name for the editable control. It is rendered above the control unless visually hidden. |
| `labelHidden` (`label-hidden`) | boolean | `false` | Visually hides the label while keeping it available to assistive technology. |
| `value` | string | — | Current text. When bound, edits are proposals and the component waits for the owner to supply the accepted value. |
| `defaultValue` (`default-value`) | string | `` | Initial value for autonomous use. Web form reset restores this value; it does not control subsequent edits. |
| `rows` | number | `4` | Visible line count of the multiline editor. It is independent of the visual size. |
| `variant` | 'outlined' \| 'filled' | `outlined` | Visual treatment of the editable control. |
| `size` | 'sm' \| 'md' \| 'lg' | `md` | Visual size of the editable control, independent of rows. |
| `placeholder` | string | — | Short input hint; it never replaces the accessible label. |
| `helpText` (`help-text`) | string | — | Optional supporting text associated with the editable control. |
| `error` | string | — | Optional externally supplied error text associated with the editable control. |
| `invalid` | boolean | `false` | External invalid state, independent of browser constraints or consumer business validation. |
| `required` | boolean | `false` | Exposes required semantics. On web, participates in native HTML constraint validation. |
| `disabled` | boolean | `false` | Disables editing and interaction. On web, follows disabled fieldsets and excludes the value from form submission. |
| `readOnly` (`read-only`) | boolean | `false` | Prevents editing while remaining focusable and form-submittable on web; distinct from disabled. |
| `maxLength` (`max-length`) | number | — | Maximum number of characters. Web uses native HTML length constraints and native applies supported input limits. |
| `name` | string | — | Form field name on web. React Native has no HTML form association or name-based submission. |

Events: `cosm-change` → `TextareaChangeDetail`.

```html
<cosm-textarea label="Textarea"></cosm-textarea>

<script type="module">
  import '@joralvmel/cosmos-elements/textarea';

  const element = document.querySelector('cosm-textarea');
  element.addEventListener('cosm-change', event => console.log(event.detail));
</script>
```
### `<cosm-radio-group>`

Selects one option from a labeled collection, with optional selection and native Web form behavior.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | string | Required | Required visible accessible name for the group. |
| `options` | RadioGroupOptions | Required | Readonly flat options with unique nonempty values and labels, optional descriptions and disabled states. |
| `value` | RadioGroupValue | — | Controlled selected value; null means no selection, and a supplied null remains controlled. |
| `defaultValue` (`default-value`) | RadioGroupValue | — | Initial autonomous selection; null by default. |
| `orientation` | 'vertical' \| 'horizontal' | `vertical` | Vertical list or wrapping horizontal options. |
| `disabled` | boolean | `false` | Prevents interaction and excludes the value from Web form submission. |
| `required` | boolean | `false` | Requires a selection in Web form validation; Native exposes descriptive semantics. |
| `invalid` | boolean | `false` | Externally supplied invalid presentation state. |
| `helpText` (`help-text`) | string | — | Optional supporting text associated with the group. |
| `errorText` (`error-text`) | string | — | Optional consumer-localized error text; a nonempty value also exposes invalid state. |
| `name` | string | — | Web form field name; React Native has no HTML form association. |

Events: `cosm-change` → `RadioGroupChangeDetail`.

```html
<cosm-radio-group label="RadioGroup"></cosm-radio-group>

<script type="module">
  import '@joralvmel/cosmos-elements/radio-group';
  const contactMethods = [{"value":"email","label":"Email","description":"Receive updates by email."},{"value":"phone","label":"Phone","description":"Receive updates by text."},{"value":"mail","label":"Mail","disabled":true}];

  const element = document.querySelector('cosm-radio-group');
  element.options = contactMethods;
  element.addEventListener('cosm-change', event => console.log(event.detail));
</script>
```

## Themes

Built-in themes: `cosmos`, `nebula`, `terra`, `supernova`, `aurora`, `solstice` (default `cosmos`), each with `light` and `dark` modes; `system` follows the OS.

```html
<html data-theme="nebula" data-mode="system">
<!-- runtime: setTheme(name), setMode(mode) from @joralvmel/cosmos-tokens/runtime -->
```

Custom themes: `defineTheme()` in `@joralvmel/cosmos-tokens` (https://joralvmel.github.io/cosmos-ui/theming/themes/).

## Rules for AI assistants

- Use Cosmos components before writing custom UI; check `list_components` / the component status page for what exists.
- Style with Cosmos tokens: `var(--cosm-*)` in CSS or the Tailwind theme utilities (`bg-primary`, `text-fg-muted`, `rounded-md`). Never hard-code colors.
- Set the theme and mode with `data-theme` and `data-mode` on the root element (or `CosmosThemeProvider` on React Native).
- Keep accessibility: give icon-only buttons a `label`, never rely on color alone, keep keyboard support.
- Never render untrusted HTML (`innerHTML`, `dangerouslySetInnerHTML`) and never build class names from user input.
- Use `<cosm-*>` elements and listen to `cosm-*` DOM events; import each component from `@joralvmel/cosmos-elements/<name>`.

<!-- generated:end -->

## Text-field layout

The web text field defaults to `20ch`, capped at its container width. Override CSS `width` for
your layout (for example `width: 100%`). Clear/reveal actions and decorations fit inside that width.
