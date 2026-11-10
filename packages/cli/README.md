# @joralvmel/cosmos-cli

Command line of [Cosmos UI](../../README.md).

## `init-ai`

Prepares a project for AI assistants:

```bash
npx @joralvmel/cosmos-cli init-ai --stack react   # react | next | angular | html | react-native | tailwind
```

- Writes a marked, regenerable block with the Cosmos rules and references into
  `.github/copilot-instructions.md` and `AGENTS.md` (`--claude` also writes `CLAUDE.md`).
- Registers the Cosmos MCP server in `.vscode/mcp.json`, keeping other servers.
- Prints the installation steps of the stack.

Options: `--no-copilot`, `--no-agents`, `--no-mcp`, `--dry-run`, `--cwd <dir>`. Running it again only
replaces the marked block.

## Other commands

`help`, `version`.

## License

MIT
