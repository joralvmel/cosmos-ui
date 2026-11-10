---
name: update-ai-references
description: 'Keeps every AI reference in sync with the code: llms.md blocks (npm run llms), docs .md pages, /llms.txt, /llms-full.txt, the MCP server data and tools, and cosmos init-ai.'
---

# update-ai-references

Main agent: `ai-tooling`. Read `AGENTS.md` first.

## Inputs

- Packages or components changed

## Steps

1. Run `npm run llms`: it rebuilds core/tokens and rewrites the generated block of every `packages/*/llms.md` (install, setup per framework, components with props, events and examples, themes, AI rules). Edit only the introduction above the block by hand.
2. Setup steps and AI rules live in `packages/core/src/setup.ts`; snippets come from `packages/core/src/codegen.ts`. Change them there so llms.md, the MCP server, `init-ai` and the docs guides stay identical.
3. New docs components must be converted in `tools/ai/page-markdown.mjs` (used by the `.md` pages, `/llms-full.txt` and the MCP search index); add a case to `tools/test/page-markdown.test.mjs`.
4. MCP tools live in `packages/mcp/src/server.ts` / `tools.ts`; data is bundled by `packages/mcp/scripts/build-data.mjs`. Keep tool names stable and update `packages/mcp/test`.
5. `cosmos init-ai` lives in `packages/cli/src/commands/init-ai.ts`; it must stay idempotent and only edit its marked block.
6. Validate with `node tools/ai/llms.mjs --check`, `npx turbo run typecheck test build --filter=...@joralvmel/cosmos-core` and a docs build (check `/llms.txt`).

## Files

- `packages/*/llms.md`
- `packages/core/src/setup.ts`
- `tools/ai/**`
- `packages/mcp/**`
- `packages/cli/**`
- `apps/docs/scripts/publish-ai.mjs`

## Checklist

- [ ] llms.md up to date (`--check`)
- [ ] MCP tests green
- [ ] init-ai tests green
- [ ] llms.txt and llms-full.txt built

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
