# @joralvmel/cosmos-cli

Command line of Cosmos UI. `init-ai` prepares a consumer project for AI assistants.

<!-- generated:start (npm run llms, do not edit this block by hand) -->

## Use

```bash
npx @joralvmel/cosmos-cli init-ai --stack react   # react | next | angular | html | react-native
```

Writes a marked, regenerable block into `.github/copilot-instructions.md` and `AGENTS.md` (`--claude` adds `CLAUDE.md`) and registers the MCP server in `.vscode/mcp.json`.

## Rules for AI assistants

- Use Cosmos components before writing custom UI; check `list_components` / the component status page for what exists.
- Style with Cosmos tokens: `var(--cosm-*)` in CSS or the Tailwind theme utilities (`bg-primary`, `text-fg-muted`, `rounded-md`). Never hard-code colors.
- Set the theme and mode with `data-theme` and `data-mode` on the root element (or `CosmosThemeProvider` on React Native).
- Keep accessibility: give icon-only buttons a `label`, never rely on color alone, keep keyboard support.
- Never render untrusted HTML (`innerHTML`, `dangerouslySetInnerHTML`) and never build class names from user input.

<!-- generated:end -->
