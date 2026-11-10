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
