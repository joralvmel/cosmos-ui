# Cosmos UI

Themeable design system with **one contract per component**, implemented as Web Components (Lit),
React and Angular wrappers, and React Native components. Themes are generated in OKLCH with light and
dark modes and verified for WCAG 2.2 AA contrast and color vision deficiencies.

> Status: pre-release (0.x). Packages are not published yet.

## Packages

| Package                                                     | Description                                                        |
| ----------------------------------------------------------- | ------------------------------------------------------------------ |
| [`@joralvmel/cosmos-tokens`](packages/tokens)               | Theme engine and design tokens (CSS, Tailwind, React Native, JSON) |
| [`@joralvmel/cosmos-tailwind`](packages/tailwind)           | Tailwind CSS v4 theme mapped to the tokens                         |
| [`@joralvmel/cosmos-core`](packages/core)                   | Component contracts, shared scenarios, headless logic              |
| [`@joralvmel/cosmos-elements`](packages/elements)           | Web Components (`<cosm-*>`)                                        |
| [`@joralvmel/cosmos-react`](packages/react)                 | React wrappers                                                     |
| [`@joralvmel/cosmos-angular`](packages/angular)             | Angular standalone components                                      |
| [`@joralvmel/cosmos-native`](packages/native)               | React Native components                                            |
| [`@joralvmel/cosmos-charts-core`](packages/charts-core)     | Chart layout (pure functions)                                      |
| [`@joralvmel/cosmos-charts`](packages/charts)               | Chart Web Components (in progress)                                 |
| [`@joralvmel/cosmos-charts-native`](packages/charts-native) | React Native charts (in progress)                                  |
| [`@joralvmel/cosmos-icons`](packages/icons)                 | Icon definitions (in progress)                                     |
| [`@joralvmel/cosmos-i18n`](packages/i18n)                   | Message formatting and `Intl` helpers                              |
| [`@joralvmel/cosmos-mcp`](packages/mcp)                     | MCP server for AI assistants (in progress)                         |
| [`@joralvmel/cosmos-cli`](packages/cli)                     | Command line (in progress)                                         |

## Quick look

```html
<html data-theme="nebula" data-mode="system">
  <link rel="stylesheet" href="node_modules/@joralvmel/cosmos-tokens/dist/tokens.css" />
  <script type="module">
    import '@joralvmel/cosmos-elements/button';
  </script>
  <cosm-button variant="soft">Save</cosm-button>
</html>
```

```tsx
import { Button } from '@joralvmel/cosmos-react';

<Button onPress={event => console.log(event.detail.source)}>Save</Button>;
```

## Development

Requirements: Node.js 24 (`.nvmrc`) and npm 11.

```bash
npm ci
npx biome ci . && npx turbo run typecheck test build
npm run docs          # http://localhost:4321
npm run generate -- component <kebab-name>
```

See [CONTRIBUTING.md](CONTRIBUTING.md), [AGENTS.md](AGENTS.md) and the
[architecture decisions](docs/adr).

## License

[MIT](LICENSE). Third-party notices: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
