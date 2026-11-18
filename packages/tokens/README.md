# @joralvmel/cosmos-tokens

Theme engine and design tokens for [Cosmos UI](../../README.md).

Generates Cosmos themes in OKLCH (light and dark), validates them for accessibility and emits
CSS variables, a Tailwind v4 theme, React Native values and JSON.

## Usage

```js
import '@joralvmel/cosmos-tokens/tokens.css';
import { setMode, setTheme, themeInitScript } from '@joralvmel/cosmos-tokens/runtime';

setTheme('nebula');
setMode('system');
```

```html
<html data-theme="nebula" data-mode="system">
```

Without `data-mode` the light mode applies; without `data-theme` the default theme (`cosmos`) applies.

Built-in themes: `cosmos` (blue), `nebula` (purple), `terra` (green), `supernova` (coral red),
`aurora` (cyan/turquoise) and `solstice` (amber/gold). Every theme includes light and dark modes
with the same semantic roles across CSS, Tailwind, React Native and JSON.
Use `builtInThemes` for web theme pickers or `themeNames` from the native entry point.
Status colors keep their meaning independently of the primary brand color; use text or icons as well.

## Custom themes

```ts
import { defineTheme, resolveTheme, toCss, validateTheme } from '@joralvmel/cosmos-tokens';

const theme = resolveTheme(
  defineTheme({ name: 'studio', seeds: { primary: 'oklch(0.56 0.15 165)' } })
);
if (!validateTheme(theme).pass) throw new Error('Theme fails accessibility checks');
const css = toCss([theme]);
```

## Entry points

| Import                                 | Content                                                                       |
| -------------------------------------- | ----------------------------------------------------------------------------- |
| `@joralvmel/cosmos-tokens`             | `defineTheme`, `resolveTheme`, `validateTheme`, outputs, built-in themes      |
| `@joralvmel/cosmos-tokens/runtime`     | `setTheme`, `setMode`, `getResolvedMode`, `themeInitScript` (no color engine) |
| `@joralvmel/cosmos-tokens/native`      | `getNativeTheme`, `nativeThemes` for React Native                             |
| `@joralvmel/cosmos-tokens/tokens.css`  | CSS variables for every theme and mode                                        |
| `@joralvmel/cosmos-tokens/tokens.json` | All values as JSON                                                            |

## License

MIT
