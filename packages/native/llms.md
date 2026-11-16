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
| `autoComplete` | string | — | Consumer-provided completion/autofill hint, mapped to attributes supported by each platform. |
| `inputMode` | 'none' \| 'text' \| 'decimal' \| 'numeric' \| 'tel' \| 'search' \| 'email' \| 'url' | — | Input or keyboard hint (none, text, decimal, numeric, tel, search, email or url); it does not add numeric or multiline field behavior. |
| `startIcon` | IconDefinition | — | Optional structured decorative icon before the editable text. |
| `endIcon` | IconDefinition | — | Optional structured decorative icon after the editable text. |
| `prefix` | string | — | Optional non-interactive text decoration before the editable text. |
| `suffix` | string | — | Optional non-interactive text decoration after the editable text. |
| `clearable` | boolean | `false` | Shows a clear action for non-empty editable fields. Supply clearLabel when enabled. |
| `clearLabel` | string | — | Consumer-supplied localized accessible name for the clear action. |
| `passwordReveal` | boolean | `false` | Opts into a reveal action for password fields. Supply both revealPasswordLabel and hidePasswordLabel when enabled. |
| `revealPasswordLabel` | string | — | Consumer-supplied localized accessible name while the password is concealed. |
| `hidePasswordLabel` | string | — | Consumer-supplied localized accessible name while the password is revealed. |

Events: `onValueChange` → `TextFieldChangeDetail`, `onSubmitEditing` → `TextFieldSubmitDetail`.

```tsx
import { TextField } from '@joralvmel/cosmos-native';
import { search } from '@joralvmel/cosmos-icons/search';

export function Example() {
  return (
    <TextField
      label="TextField"
      startIcon={search}
      endIcon={search}
      onValueChange={detail => console.log(detail)}
      onSubmitEditing={detail => console.log(detail)}
    >
    </TextField>
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
