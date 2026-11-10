# @joralvmel/cosmos-mcp

[Model Context Protocol](https://modelcontextprotocol.io/) server of [Cosmos UI](../../README.md). It
gives AI assistants the real API of the installed version: components with snippets for every platform,
their status, themes, tokens, setup guides and a docs search.

## Use

```bash
npx -y @joralvmel/cosmos-mcp   # stdio server
```

VS Code (`.vscode/mcp.json`, or run `npx @joralvmel/cosmos-cli init-ai`):

```json
{ "servers": { "cosmos-ui": { "type": "stdio", "command": "npx", "args": ["-y", "@joralvmel/cosmos-mcp"] } } }
```

| Tool | Returns |
| --- | --- |
| `list_components` | Catalog components with category, platforms, dependencies and status |
| `get_component` | Contract, API table, snippets (HTML, React, Angular, React Native), imports and status |
| `list_themes` / `get_tokens` | Built-in themes; semantic tokens of a theme and mode |
| `get_setup` | Install commands, setup code and rules for `react`, `next`, `angular`, `html`, `react-native`, `tailwind` |
| `search_docs` | Docs pages and package references matching a query |

Resources: `cosmos://llms/<package>` (the `llms.md` of each package).

## Programmatic use

```ts
import { createServer, getComponent } from '@joralvmel/cosmos-mcp';
```

The data (status, docs and references) is bundled at build time by `scripts/build-data.mjs`.

## License

MIT
