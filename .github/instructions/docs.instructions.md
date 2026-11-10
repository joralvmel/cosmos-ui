---
applyTo: 'apps/docs/**'
---

# Docs site (Astro 7 + Starlight)

- Follow [`docs/conventions/component-anatomy.md`](../../docs/conventions/component-anatomy.md): exact file names and section order. `tools/test/structure.test.mjs` checks every implemented component.
- Every English page in `src/content/docs/` has a Spanish twin in `src/content/docs/es/` (a test checks
  it). Write natural text for each language; do not machine-translate code.
- Component pages: introduction, `<Playground name="<name>" />`, examples in `<Preview>`, usage per
  platform (React, Angular, React Native), accessibility notes and `<ApiTable name="<name>" />`.
- `Playground` and `ApiTable` read the contract from core: never duplicate API tables by hand.
- Previews follow the Cosmos theme picked in the header and the site mode; use `data-fixed` /
  `data-fixed-mode` only for galleries that must show a specific theme or mode.
- Examples use neutral data (`example.com`, fictional names).
- Client scripts never use `innerHTML`; update text with `textContent`.
- Validate with `npx turbo run typecheck test build --filter=@joralvmel/cosmos-docs`.
