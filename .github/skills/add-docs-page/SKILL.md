---
name: add-docs-page
description: 'Adds a documentation page in English and Spanish with Playground, examples per framework, API table and accessibility notes.'
---

# add-docs-page

Main agent: `docs-writer`. Read `AGENTS.md` first.

## Inputs

- Page topic or component name

## Steps

1. Create `apps/docs/src/content/docs/<section>/<slug>.mdx` and the Spanish twin under `es/`.
2. Component pages: intro, `<Playground name>`, `<Preview>` examples, usage for React/Angular/React Native, accessibility, `<ApiTable name>`.
3. Use neutral example data; keep code samples valid.
4. Run `npx turbo run typecheck test build --filter=@joralvmel/cosmos-docs`.

## Files

- `apps/docs/src/content/docs/**`

## Checklist

- [ ] EN + ES
- [ ] Builds without warnings
- [ ] Links valid

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
