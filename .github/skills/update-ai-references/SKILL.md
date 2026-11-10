---
name: update-ai-references
description: 'Regenerates and validates llms.md, llms.txt and the MCP tools so AI assistants match the real API.'
---

# update-ai-references

Main agent: `ai-tooling`. Read `AGENTS.md` first.

## Inputs

- Packages or components changed

## Steps

1. Update `packages/<pkg>/llms.md` from the contracts (props, events per platform, examples).
2. Update the root `llms.txt` index if packages were added.
3. Update MCP data/tools in `packages/mcp` and their tests.
4. Build the docs: references are published under `/llms.txt` and `/ai/`.

## Files

- `packages/*/llms.md`
- `llms.txt`
- `packages/mcp/**`

## Checklist

- [ ] References match contracts
- [ ] MCP tests green

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
