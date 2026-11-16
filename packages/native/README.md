# @joralvmel/cosmos-native

React Native components for [Cosmos UI](../../README.md).

Cosmos components for React Native and Expo, with the same contracts and themes as the web.

```tsx
import { Button, CosmosThemeProvider } from '@joralvmel/cosmos-native';

export default function App() {
  return (
    <CosmosThemeProvider theme="nebula" mode="system">
      <Button onPress={({ source }) => console.log(source)}>Save</Button>
    </CosmosThemeProvider>
  );
}
```

`useTheme()` returns the active theme (colors, spacing, radius, typography as numbers).

## Text field

`TextField` supports single-line text, email, password, telephone, URL and search input, semantic or
numeric minimum heights, optional decorations and opt-in clear/reveal actions. Use it inside
`CosmosThemeProvider`:

```tsx
<TextField
  label="Email"
  type="email"
  autoComplete="email"
  clearable
  clearLabel="Clear email"
  onValueChange={({ value }) => console.log(value)}
/>
```

Bind `value` to control acceptance; otherwise `defaultValue` initializes autonomous editing.
Native callbacks receive `{ value }`, not DOM events. Provide localized labels for optional
actions and localized required/error wording in the label or supporting text. Native does not
emulate HTML form submission, email constraints or regular-expression validation.

Customize independently through `appearance` (background, text, placeholder, border, focus and
radius) and the component style props. On React Native Web, the outer control owns the themed
inward focus indicator; the editable input does not add a second browser outline. The focused
boundary remains visible in forced-colors mode.

Icons are passive artwork, not independent pointer or keyboard focus targets; clear/reveal
buttons retain their own focus and keyboard behavior. With long affixes, icons and both actions,
the editable input reserves at least 44 units of width while affixes shrink and truncate.

The implementation is stable with explicitly deferred platform and accessibility checks;
see the [design evidence](../../docs/design/text-field.md) for what is verified and what is not.

## License

MIT
