# @joralvmel/cosmos-angular

Angular standalone components for the Cosmos Web Components. Inputs map to element properties; outputs re-emit the original CustomEvent; form controls provide ControlValueAccessors.

<!-- generated:start (npm run llms, do not edit this block by hand) -->

## Setup: Angular (standalone)

```bash
npm install @joralvmel/cosmos-angular @joralvmel/cosmos-tokens
```

**Load the tokens** (`angular.json`)

```json
"styles": ["node_modules/@joralvmel/cosmos-tokens/dist/tokens.css", "src/styles.css"]
```

**Choose theme and mode** (`src/index.html`)

```html
<html data-theme="cosmos" data-mode="system">
```

**Import components** (`src/app/app.component.ts`)

```ts
import { Component } from '@angular/core';
import { CosmButtonComponent } from '@joralvmel/cosmos-angular';

@Component({
  selector: 'app-root',
  imports: [CosmButtonComponent],
  template: `<cosm-button (press)="save($event.detail.source)">Save</cosm-button>`,
})
export class AppComponent {
  save(source: string) {}
}
```

- Components are standalone; import them individually or spread `COSMOS_COMPONENTS`.
- Outputs re-emit the original CustomEvent: use `$event.detail`. Form controls provide ControlValueAccessors.

Guide: https://joralvmel.github.io/cosmos-ui/guides/angular/

## Components

Every component of this package (status of planned ones: https://joralvmel.github.io/cosmos-ui/components/status/).

### `CosmButtonComponent` (`<cosm-button>`)

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

Events: `(press)` → `ButtonPressDetail`.

```ts
import { Component } from '@angular/core';
import { CosmButtonComponent } from '@joralvmel/cosmos-angular';
import type { ButtonPressDetail } from '@joralvmel/cosmos-core';

@Component({
  selector: 'app-example',
  imports: [CosmButtonComponent],
  template: `<cosm-button (press)="onPress($event.detail)">Button</cosm-button>`,
})
export class ExampleComponent {
  onPress(detail: ButtonPressDetail) {
    console.log(detail);
  }
}
```
### `CosmIconComponent` (`<cosm-icon>`)

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

```ts
import { Component } from '@angular/core';
import { CosmIconComponent } from '@joralvmel/cosmos-angular';
import { house } from '@joralvmel/cosmos-icons/house';

@Component({
  selector: 'app-example',
  imports: [CosmIconComponent],
  template: `<cosm-icon [icon]="house"></cosm-icon>`,
})
export class ExampleComponent {
  readonly house = house;
}
```
### `CosmTextFieldComponent` (`<cosm-text-field>`)

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

Events: `(valueChange)` → `TextFieldChangeDetail`, `(submit)` → `TextFieldSubmitDetail`.

```ts
import { Component } from '@angular/core';
import { CosmTextFieldComponent } from '@joralvmel/cosmos-angular';
import { search } from '@joralvmel/cosmos-icons/search';
import type { TextFieldChangeDetail, TextFieldSubmitDetail } from '@joralvmel/cosmos-core';

@Component({
  selector: 'app-example',
  imports: [CosmTextFieldComponent],
  template: `<cosm-text-field label="TextField" [startIcon]="search" [endIcon]="search" (valueChange)="onValueChange($event.detail)" (submit)="onSubmit($event.detail)"></cosm-text-field>`,
})
export class ExampleComponent {
  readonly search = search;
  onValueChange(detail: TextFieldChangeDetail) {
    console.log(detail);
  }

  onSubmit(detail: TextFieldSubmitDetail) {
    console.log(detail);
  }
}
```
### `CosmIconButtonComponent` (`<cosm-icon-button>`)

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

Events: `(press)` → `IconButtonPressDetail`, `(pressedChange)` → `IconButtonPressedChangeDetail`.

```ts
import { heart } from '@joralvmel/cosmos-icons/heart';
import { Component } from '@angular/core';
import { CosmIconButtonComponent, CosmIconComponent } from '@joralvmel/cosmos-angular';
import type { IconButtonPressDetail, IconButtonPressedChangeDetail } from '@joralvmel/cosmos-core';

@Component({
  selector: 'app-example',
  imports: [CosmIconButtonComponent, CosmIconComponent],
  template: `<cosm-icon-button label="IconButton" (press)="onPress($event.detail)" (pressedChange)="onPressedChange($event.detail)"><cosm-icon [icon]="heart"></cosm-icon></cosm-icon-button>`,
})
export class ExampleComponent {
  readonly heart = heart;
  onPress(detail: IconButtonPressDetail) {
    console.log(detail);
  }

  onPressedChange(detail: IconButtonPressedChangeDetail) {
    console.log(detail);
  }
}
```
### `CosmPopoverComponent` (`<cosm-popover>`)

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

Events: `(openChange)` → `PopoverOpenChangeDetail`.

```ts
import { Component } from '@angular/core';
import { CosmPopoverComponent, CosmIconButtonComponent, CosmIconComponent } from '@joralvmel/cosmos-angular';
import { info } from '@joralvmel/cosmos-icons/info';
import type { PopoverOpenChangeDetail } from '@joralvmel/cosmos-core';

@Component({
  selector: 'app-example',
  imports: [CosmPopoverComponent, CosmIconButtonComponent, CosmIconComponent],
  template: `<cosm-popover (openChange)="onOpenChange($event.detail)"><cosm-icon-button slot="trigger" label="Details" variant="ghost" tone="neutral"><cosm-icon [icon]="info" /></cosm-icon-button>Popover</cosm-popover>`,
})
export class ExampleComponent {
  readonly info = info;
  onOpenChange(detail: PopoverOpenChangeDetail) {
    console.log(detail);
  }
}
```
### `CosmListboxComponent` (`<cosm-listbox>`)

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

Events: `(selectionChange)` → `ListboxSelectionChangeDetail`.

```ts
import { Component } from '@angular/core';
import { CosmListboxComponent } from '@joralvmel/cosmos-angular';
const grouped = [{"label":"Fruit","options":[{"value":"apple","label":"Apple"},{"value":"cherry","label":"Cherry","description":"Seasonal"}]},{"label":"Vegetables","options":[{"value":"carrot","label":"Carrot"},{"value":"broccoli","label":"Broccoli","disabled":true}]}] as const;
const empty = [] as const;
import type { ListboxSelectionChangeDetail } from '@joralvmel/cosmos-core';

@Component({
  selector: 'app-example',
  imports: [CosmListboxComponent],
  template: `<cosm-listbox label="Listbox" [items]="grouped" [defaultSelectedValues]="empty" (selectionChange)="onSelectionChange($event.detail)"></cosm-listbox>`,
})
export class ExampleComponent {
  readonly grouped = grouped;
  readonly empty = empty;
  onSelectionChange(detail: ListboxSelectionChangeDetail) {
    console.log(detail);
  }
}
```
### `CosmCheckboxComponent` (`<cosm-checkbox>`)

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

Events: `(checkedChange)` → `CheckboxCheckedChangeDetail`.

```ts
import { Component } from '@angular/core';
import { CosmCheckboxComponent } from '@joralvmel/cosmos-angular';
import type { CheckboxCheckedChangeDetail } from '@joralvmel/cosmos-core';

@Component({
  selector: 'app-example',
  imports: [CosmCheckboxComponent],
  template: `<cosm-checkbox label="Checkbox" (checkedChange)="onCheckedChange($event.detail)">Checkbox</cosm-checkbox>`,
})
export class ExampleComponent {
  onCheckedChange(detail: CheckboxCheckedChangeDetail) {
    console.log(detail);
  }
}
```
### `CosmSwitchComponent` (`<cosm-switch>`)

Toggles a binary setting immediately with a stable accessible name and form behavior on the web.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | string | Required | Required nonempty accessible name; remains stable in both states. |
| `hideLabel` | boolean | `false` | Visually hides the label while retaining its accessible name. |
| `checked` | boolean | `false` | Controlled checked value when supplied, including false; activation proposes changes without self-committing. |
| `defaultChecked` | boolean | `false` | Initial autonomous checked value; later changes do not reset it. |
| `size` | 'sm' \| 'md' \| 'lg' \| number | `md` | Web visual size preset or positive finite CSS-pixel size. Native uses system Switch sizing; numeric sizes do not scale it. |
| `disabled` | boolean | `false` | Prevents user interaction and excludes the value from web form submission. |
| `helpText` | string | — | Optional consumer-localized supporting text associated with the switch. |
| `name` | string | — | Web form field name; React Native has no HTML form association. |
| `value` | string | `on` | Web form value submitted when checked and enabled; defaults to on. Angular Forms uses checked as its boolean value. |

Events: `(checkedChange)` → `SwitchCheckedChangeDetail`.

```ts
import { Component } from '@angular/core';
import { CosmSwitchComponent } from '@joralvmel/cosmos-angular';
import type { SwitchCheckedChangeDetail } from '@joralvmel/cosmos-core';

@Component({
  selector: 'app-example',
  imports: [CosmSwitchComponent],
  template: `<cosm-switch label="Switch" (checkedChange)="onCheckedChange($event.detail)"></cosm-switch>`,
})
export class ExampleComponent {
  onCheckedChange(detail: SwitchCheckedChangeDetail) {
    console.log(detail);
  }
}
```

## Themes

Built-in themes: `cosmos`, `nebula` (default `cosmos`), each with `light` and `dark` modes; `system` follows the OS.

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
- Import the standalone components from `@joralvmel/cosmos-angular` (`CosmButtonComponent`…); outputs emit the CustomEvent (`$event.detail`).

<!-- generated:end -->
