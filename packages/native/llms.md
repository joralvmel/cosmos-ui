# @joralvmel/cosmos-native

React Native components of Cosmos UI with the same contracts and themes as the web. Callbacks receive the event detail directly.

<!-- generated:start (npm run llms, do not edit this block by hand) -->

## Setup: React Native (Expo)

```bash
npx expo install @joralvmel/cosmos-native
```

**Provide a theme** (`app/_layout.tsx`)

```tsx
import { CosmosThemeProvider } from '@joralvmel/cosmos-native';
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <CosmosThemeProvider theme="cosmos" mode="system">
      <Stack />
    </CosmosThemeProvider>
  );
}
```

**Use components** (`app/index.tsx`)

```tsx
import { Button } from '@joralvmel/cosmos-native';

export default function Home() {
  return <Button onPress={({ source }) => console.log(source)}>Save</Button>;
}
```

- Callbacks receive the event detail directly (`onPress(detail)`).
- `useTheme()` returns colors, spacing, radius and typography as numbers for your own styles.

Guide: https://joralvmel.github.io/cosmos-ui/guides/react-native/

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
| `label` | string | — | Accessible name when the visible content is not descriptive (icon-only buttons). |

Events: `onPress` → `ButtonPressDetail`.

```tsx
import { Button } from '@joralvmel/cosmos-native';

export function Example() {
  return (
    <Button onPress={detail => console.log(detail)}>Button</Button>
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
import { Icon } from '@joralvmel/cosmos-native';
import { house } from '@joralvmel/cosmos-icons/house';

export function Example() {
  return (
    <Icon icon={house}></Icon>
  );
}
```

## Themes

Built-in themes: `cosmos`, `nebula` (default `cosmos`), each with `light` and `dark` modes; `system` follows the OS.

```tsx
<CosmosThemeProvider theme="nebula" mode="system">{children}</CosmosThemeProvider>
```

Custom themes: `defineTheme()` in `@joralvmel/cosmos-tokens` (https://joralvmel.github.io/cosmos-ui/theming/themes/).

## Rules for AI assistants

- Use Cosmos components before writing custom UI; check `list_components` / the component status page for what exists.
- Style with Cosmos tokens: `var(--cosm-*)` in CSS or the Tailwind theme utilities (`bg-primary`, `text-fg-muted`, `rounded-md`). Never hard-code colors.
- Set the theme and mode with `data-theme` and `data-mode` on the root element (or `CosmosThemeProvider` on React Native).
- Keep accessibility: give icon-only buttons a `label`, never rely on color alone, keep keyboard support.
- Never render untrusted HTML (`innerHTML`, `dangerouslySetInnerHTML`) and never build class names from user input.
- Import components from `@joralvmel/cosmos-native`, wrap the app in `CosmosThemeProvider` and read values with `useTheme()`.
- Callbacks receive the detail directly (`onPress(detail)`).

<!-- generated:end -->
