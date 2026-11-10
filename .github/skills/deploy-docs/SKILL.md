---
name: deploy-docs
description: 'Deploys the docs site (and demos) to GitHub Pages once enabled.'
---

# deploy-docs

Main agent: `devops`. Read `AGENTS.md` first.

## Inputs

- Target URL

## Steps

1. Enable GitHub Pages with the GitHub Actions source and set `COSMOS_DOCS_ENABLED=true`.
2. Run the `Docs` workflow; `COSMOS_DOCS_URL` is taken from `configure-pages`.
3. Verify `/llms.txt` and `/ai/*.md` are published.

## Files

- `.github/workflows/docs.yml`
- `apps/docs/astro.config.mjs`

## Checklist

- [ ] Site reachable
- [ ] Base path correct

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
