# @joralvmel/cosmos-react

React 19 wrappers of the Cosmos Web Components (Vite, Next.js). Props map to element properties; event props receive the original CustomEvent.

<!-- generated:start (npm run llms, do not edit this block by hand) -->

## Setup: React (Vite)

```bash
npm install @joralvmel/cosmos-react @joralvmel/cosmos-tokens
```

**Load the tokens once** (`src/main.tsx`)

```tsx
import '@joralvmel/cosmos-tokens/tokens.css';
```

**Choose theme and mode** (`index.html`)

```html
<html data-theme="cosmos" data-mode="system">
```

**Use components** (`src/App.tsx`)

```tsx
import { Button } from '@joralvmel/cosmos-react';

export default function App() {
  return <Button onPress={event => console.log(event.detail.source)}>Save</Button>;
}
```

- Event props (`onPress`, `onChange`…) receive the original CustomEvent: read `event.detail`.
- Change theme and mode at runtime with `setTheme()` / `setMode()` from `@joralvmel/cosmos-tokens/runtime`.

Guide: https://joralvmel.github.io/cosmos-ui/guides/react-vite/

## Setup: Next.js (App Router)

```bash
npm install @joralvmel/cosmos-react @joralvmel/cosmos-tokens
```

**Load the tokens and avoid a theme flash** (`app/layout.tsx`)

```tsx
import '@joralvmel/cosmos-tokens/tokens.css';
import { themeInitScript } from '@joralvmel/cosmos-tokens/runtime';
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="cosmos" data-mode="system" suppressHydrationWarning>
      <body>
        <Script id="cosmos-theme" strategy="beforeInteractive">
          {themeInitScript()}
        </Script>
        {children}
      </body>
    </html>
  );
}
```

**Use components in Client Components** (`app/save-button.tsx`)

```tsx
'use client';

import { Button } from '@joralvmel/cosmos-react';

export function SaveButton() {
  return <Button onPress={() => console.log('saved')}>Save</Button>;
}
```

- Cosmos components are Web Components: render them from Client Components (`'use client'`). Server Components can render the Client Component that wraps them.
- The server HTML contains the custom element tag; it upgrades in the browser.

Guide: https://joralvmel.github.io/cosmos-ui/guides/nextjs/

## Components

Every component of this package (status of planned ones: https://joralvmel.github.io/cosmos-ui/components/status/).

### `Button`

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
| `currentPage` | boolean | `false` | Identifies this action as the current page in a composed pagination control; not a toggle. |

Events: `onPress` → `ButtonPressDetail`.

```tsx
import { Button } from '@joralvmel/cosmos-react';

export function Example() {
  return (
    <Button onPress={event => console.log(event.detail)}>Button</Button>
  );
}
```
### `Icon`

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

Events: none.

```tsx
import { Icon } from '@joralvmel/cosmos-react';
import { house } from '@joralvmel/cosmos-icons/house';

export function Example() {
  return (
    <Icon icon={house}></Icon>
  );
}
```
### `TextField`

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

Events: `onChange` → `TextFieldChangeDetail`, `onSubmit` → `TextFieldSubmitDetail`.

```tsx
import { TextField } from '@joralvmel/cosmos-react';
import { search } from '@joralvmel/cosmos-icons/search';

export function Example() {
  return (
    <TextField
      label="TextField"
      startIcon={search}
      endIcon={search}
      onChange={event => console.log(event.detail)}
      onSubmit={event => console.log(event.detail)}
    >
    </TextField>
  );
}
```
### `IconButton`

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

Events: `onPress` → `IconButtonPressDetail`, `onPressedChange` → `IconButtonPressedChangeDetail`.

```tsx
import { heart } from '@joralvmel/cosmos-icons/heart';
import { IconButton, Icon } from '@joralvmel/cosmos-react';

export function Example() {
  return (
    <IconButton
      label="IconButton"
      onPress={event => console.log(event.detail)}
      onPressedChange={event => console.log(event.detail)}
    >
      <Icon icon={heart}></Icon>
    </IconButton>
  );
}
```
### `Popover`

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

Events: `onOpenChange` → `PopoverOpenChangeDetail`.

```tsx
import { Popover, IconButton, Icon } from '@joralvmel/cosmos-react';
import { info } from '@joralvmel/cosmos-icons/info';

export function Example() {
  return (
    <Popover
      onOpenChange={event => console.log(event.detail)}
    >
      <IconButton slot="trigger" label="Details" variant="ghost" tone="neutral"><Icon icon={info} /></IconButton>
      Popover
    </Popover>
  );
}
```
### `Listbox`

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

Events: `onSelectionChange` → `ListboxSelectionChangeDetail`.

```tsx
import { Listbox } from '@joralvmel/cosmos-react';
const grouped = [{"label":"Fruit","options":[{"value":"apple","label":"Apple"},{"value":"cherry","label":"Cherry","description":"Seasonal"}]},{"label":"Vegetables","options":[{"value":"carrot","label":"Carrot"},{"value":"broccoli","label":"Broccoli","disabled":true}]}] as const;
const empty = [] as const;

export function Example() {
  return (
    <Listbox
      label="Listbox"
      items={grouped}
      defaultSelectedValues={empty}
      onSelectionChange={event => console.log(event.detail)}
    >
    </Listbox>
  );
}
```
### `Checkbox`

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

Events: `onCheckedChange` → `CheckboxCheckedChangeDetail`.

```tsx
import { Checkbox } from '@joralvmel/cosmos-react';

export function Example() {
  return (
    <Checkbox
      label="Checkbox"
      onCheckedChange={event => console.log(event.detail)}
    >
      Checkbox
    </Checkbox>
  );
}
```
### `Switch`

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

Events: `onCheckedChange` → `SwitchCheckedChangeDetail`.

```tsx
import { Switch } from '@joralvmel/cosmos-react';

export function Example() {
  return (
    <Switch
      label="Switch"
      onCheckedChange={event => console.log(event.detail)}
    >
    </Switch>
  );
}
```
### `Badge`

Displays a noninteractive status or category label, or caller-formatted count, with an optional decorative leading icon.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | 'soft' \| 'solid' \| 'outline' | `soft` | Visual treatment of the static label. |
| `tone` | 'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger' | `neutral` | Semantic color intent of the static label. |
| `size` | 'sm' \| 'md' \| 'lg' | `md` | Semantic label size. |
| `startIcon` | IconDefinition | — | Optional structured decorative icon before the label. |

Events: none.

```tsx
import { Badge } from '@joralvmel/cosmos-react';
import { heart } from '@joralvmel/cosmos-icons/heart';

export function Example() {
  return (
    <Badge startIcon={heart}>Badge</Badge>
  );
}
```
### `Calendar`

Selects one Gregorian date from an inline, localized calendar with keyboard navigation and optional bounds. Month and year can be selected directly.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | string | — | Controlled selected date in YYYY-MM-DD format; when supplied, selection proposals wait for the owner to update this value. |
| `defaultValue` | string | — | Initial autonomous selected date in YYYY-MM-DD format; later changes do not reset selection. |
| `min` | string | — | Earliest selectable date in YYYY-MM-DD format, inclusive. |
| `max` | string | — | Latest selectable date in YYYY-MM-DD format, inclusive. |
| `locale` | string | — | BCP 47 locale for month and weekday names, week start, and text direction; defaults to the environment locale. Invalid locale identifiers are rejected. |
| `disabled` | boolean | `false` | Disables date selection and calendar navigation. |

Events: `onChange` → `CalendarChangeDetail`.

```tsx
import { Calendar } from '@joralvmel/cosmos-react';

export function Example() {
  return (
    <Calendar onChange={event => console.log(event.detail)}></Calendar>
  );
}
```
### `Textarea`

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

Events: `onChange` → `TextareaChangeDetail`.

```tsx
import { Textarea } from '@joralvmel/cosmos-react';

export function Example() {
  return (
    <Textarea
      label="Textarea"
      onChange={event => console.log(event.detail)}
    >
    </Textarea>
  );
}
```
### `RadioGroup`

Selects one option from a labeled collection, with optional selection and native Web form behavior.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | string | Required | Required visible accessible name for the group. |
| `options` | RadioGroupOptions | Required | Readonly flat options with unique nonempty values and labels, optional descriptions and disabled states. |
| `value` | RadioGroupValue | — | Controlled selected value; null means no selection, and a supplied null remains controlled. |
| `defaultValue` | RadioGroupValue | — | Initial autonomous selection; null by default. |
| `size` | 'sm' \| 'md' \| 'lg' \| number | `md` | Indicator size token or positive finite number in CSS pixels on web and logical units on native. |
| `orientation` | 'vertical' \| 'horizontal' | `vertical` | Vertical list or wrapping horizontal options. |
| `disabled` | boolean | `false` | Prevents interaction and excludes the value from Web form submission. |
| `required` | boolean | `false` | Requires a selection in Web form validation; Native exposes descriptive semantics. |
| `invalid` | boolean | `false` | Externally supplied invalid presentation state. |
| `helpText` | string | — | Optional supporting text associated with the group. |
| `errorText` | string | — | Optional consumer-localized error text; a nonempty value also exposes invalid state. |
| `name` | string | — | Web form field name; React Native has no HTML form association. |

Events: `onChange` → `RadioGroupChangeDetail`.

```tsx
import { RadioGroup } from '@joralvmel/cosmos-react';
const contactMethods = [{"value":"email","label":"Email","description":"Receive updates by email."},{"value":"phone","label":"Phone","description":"Receive updates by text."},{"value":"mail","label":"Mail","disabled":true}] as const;

export function Example() {
  return (
    <RadioGroup
      label="RadioGroup"
      options={contactMethods}
      onChange={event => console.log(event.detail)}
    >
    </RadioGroup>
  );
}
```
### `Select`

Selects one option from an accessible collection, with native Web form behavior.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | string | Required | Required visible accessible name for the control. |
| `items` | SelectItems | Required | Readonly flat options with unique nonempty values, nonempty labels, and optional disabled state. |
| `value` | SelectValue | — | Controlled selected value; null means no selection, and a supplied null remains controlled. |
| `defaultValue` | SelectValue | — | Initial autonomous selection; null by default. |
| `placeholder` | string | Required | Consumer-localized text shown when no value is selected. |
| `variant` | 'outlined' \| 'filled' | `outlined` | Outlined or filled trigger appearance. |
| `size` | 'sm' \| 'md' \| 'lg' | `md` | Small, medium, or large control size. |
| `disabled` | boolean | `false` | Prevents interaction and excludes the value from Web form submission. |
| `required` | boolean | `false` | Requires a selection in Web form validation; Native exposes descriptive semantics. |
| `invalid` | boolean | `false` | Externally supplied invalid presentation state. |
| `helpText` | string | — | Optional supporting text associated with the control. |
| `errorText` | string | — | Optional consumer-localized error text; a nonempty value also exposes invalid state. |
| `name` | string | — | Web form field name; React Native has no HTML form association. |

Events: `onChange` → `SelectChangeDetail`.

```tsx
import { Select } from '@joralvmel/cosmos-react';
const flat = [{"value":"apple","label":"Apple"},{"value":"cherry","label":"Cherry"},{"value":"lime","label":"Lime","disabled":true}] as const;
const none = null as const;

export function Example() {
  return (
    <Select
      label="Select"
      items={flat}
      defaultValue={none}
      placeholder="Select"
      onChange={event => console.log(event.detail)}
    >
    </Select>
  );
}
```
### `Pagination`

Navigates a known number of pages using buttons.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `totalPages` | number | Required | Required nonnegative safe integer page count. |
| `page` | number | — | Controlled one-based safe integer page; out-of-range values are displayed clamped. |
| `defaultPage` | number | `1` | Initial one-based page for autonomous state. |
| `label` | string | Required | Required localized navigation landmark label. |
| `previousLabel` | string | `Previous page` | Previous button label. |
| `nextLabel` | string | `Next page` | Next button label. |
| `firstLabel` | string | `First page` | First button label. |
| `lastLabel` | string | `Last page` | Last button label. |
| `pageLabel` | string | `Page {page}` | Page button label template; {page} is replaced with the localized number. |
| `summaryLabel` | string | `Page {page} of {total}` | Compact summary template with {page} and {total} placeholders. |
| `locale` | string | — | Locale for formatted page numbers. |
| `direction` | 'ltr' \| 'rtl' | `ltr` | Layout and directional icon direction. |
| `presentation` | 'numbered' \| 'compact' | `numbered` | Show up to seven fixed-width numbered positions or a compact summary. |
| `variant` | 'solid' \| 'soft' \| 'outline' | `solid` | Selected page emphasis. |
| `size` | 'sm' \| 'md' \| 'lg' | `md` | Control size. |
| `showFirstLast` | boolean | `false` | Show first and last page controls. |
| `disabled` | boolean | `false` | Disable all controls. |

Events: `onChange` → `PaginationChangeDetail`.

```tsx
import { Pagination } from '@joralvmel/cosmos-react';

export function Example() {
  return (
    <Pagination
      label="Pagination"
      onChange={event => console.log(event.detail)}
    >
    </Pagination>
  );
}
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
- Import components from `@joralvmel/cosmos-react`; event props receive the CustomEvent (`event.detail`).

<!-- generated:end -->
