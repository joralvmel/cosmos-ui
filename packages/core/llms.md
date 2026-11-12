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


## Rules for AI assistants

- Use Cosmos components before writing custom UI; check `list_components` / the component status page for what exists.
- Style with Cosmos tokens: `var(--cosm-*)` in CSS or the Tailwind theme utilities (`bg-primary`, `text-fg-muted`, `rounded-md`). Never hard-code colors.
- Set the theme and mode with `data-theme` and `data-mode` on the root element (or `CosmosThemeProvider` on React Native).
- Keep accessibility: give icon-only buttons a `label`, never rely on color alone, keep keyboard support.
- Never render untrusted HTML (`innerHTML`, `dangerouslySetInnerHTML`) and never build class names from user input.

<!-- generated:end -->
