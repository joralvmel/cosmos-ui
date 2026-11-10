---
name: add-playground
description: 'Adds the interactive Playground to a component page: controls generated from the contract, code tabs for HTML, React, Angular and React Native, copy button, theme/mode pickers and the native demo link.'
---

# add-playground

Main agent: `docs-writer`. Read `AGENTS.md` first.

## Inputs

- Component name

## Steps

1. Add `<Playground name="<name>" content="<text>" />` right after the introduction, under `## Playground` (EN and ES pages; the generator template already does it).
2. Controls come from the contract props; snippets come from `apps/docs/src/lib/codegen.ts` (prop/event mapping of ADR 0003, defaults omitted). Never hand-write per-component playground code.
3. If a prop needs a new kind of control (e.g. a list of options or a date), extend `apps/docs/src/lib/playground.ts` generically and add a case to `apps/docs/test/playground.test.ts`.
4. If the output of a platform is wrong, fix `codegen.ts` and add a case to `apps/docs/test/codegen.test.ts`.
5. Keep the UI accessible (APG tabs, labels, `role="status"` for copy feedback) and build text only with `textContent`.
6. The native demo link appears automatically when `apps/native-demo/app/<name>.tsx` exists.
7. Run `npx turbo run typecheck test build --filter=@joralvmel/cosmos-docs` and check the page in `npm run docs`.

## Files

- Component docs pages
- `apps/docs/src/lib/codegen.ts`
- `apps/docs/src/lib/playground.ts`
- `apps/docs/src/components/Playground.astro`

## Checklist

- [ ] Snippets correct on the 4 platforms
- [ ] Defaults omitted
- [ ] Keyboard navigation of tabs works
- [ ] No innerHTML

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
