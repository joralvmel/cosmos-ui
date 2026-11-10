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

## License

MIT
