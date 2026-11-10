# @joralvmel/cosmos-mcp

Model Context Protocol server (stdio, binary `cosmos-mcp`) that gives AI assistants the real Cosmos API: components with snippets for every platform, status, themes, tokens, setup guides and docs search.

<!-- generated:start (npm run llms, do not edit this block by hand) -->

## Use

```json
{
  "servers": {
    "cosmos-ui": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@joralvmel/cosmos-mcp"
      ]
    }
  }
}
```

Tools: `list_components`, `get_component`, `list_themes`, `get_tokens`, `get_setup`, `search_docs`. Resources: `cosmos://llms/<package>`.

## Rules for AI assistants

- Use Cosmos components before writing custom UI; check `list_components` / the component status page for what exists.
- Style with Cosmos tokens: `var(--cosm-*)` in CSS or the Tailwind theme utilities (`bg-primary`, `text-fg-muted`, `rounded-md`). Never hard-code colors.
- Set the theme and mode with `data-theme` and `data-mode` on the root element (or `CosmosThemeProvider` on React Native).
- Keep accessibility: give icon-only buttons a `label`, never rely on color alone, keep keyboard support.
- Never render untrusted HTML (`innerHTML`, `dangerouslySetInnerHTML`) and never build class names from user input.

<!-- generated:end -->
