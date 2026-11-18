---
applyTo: 'apps/docs/**'
---

# Docs site (Astro 7 + Starlight)

- Follow [`docs/conventions/component-anatomy.md`](../../docs/conventions/component-anatomy.md): exact file names and section order. `tools/test/structure.test.mjs` checks every implemented component.
- Every English page in `src/content/docs/` has a Spanish twin in `src/content/docs/es/` (a test checks
  it). Write natural text for each language; do not machine-translate code.
- Never translate component names: keep the English name in page titles, navigation and references
  (Checkbox, Text Field, Icon). Translate descriptions, explanations and example labels, not names.
  Localized component page titles must match the English page; `test/content.test.ts` enforces this
  against the component catalog.
- Component pages (anatomy order): `<StatusBadge>` + introduction, `## Playground` (`<Playground>`),
  variants, states, accessibility, `## API` (`<ApiTable>`), events by platform (`<EventsTable>`).
- `Playground`, `ApiTable`, `EventsTable` and `StatusBadge` read the contract and the inventory: never
  duplicate API tables or per-platform code by hand. Snippets come from `packages/core/src/codegen.ts`.
- Previews follow the Cosmos theme picked in the header and the site mode; use `data-fixed` /
  `data-fixed-mode` only for galleries that must show a specific theme or mode.
- Use the shared Playground frame, contract controls and highlighted code tabs for every component.
  Keep copying based on the raw generated snippet, never the highlighted DOM. Do not fork the frame
  for individual components; extend shared controls with focused tests. Catalogs stay lazy-loaded.
- Examples use neutral data (`example.com`, fictional names).
- Client scripts never use `innerHTML`; update text with `textContent`.
- Validate with `npx turbo run typecheck test build --filter=@joralvmel/cosmos-docs`.
