---
applyTo: 'apps/docs/**'
---

# Docs site (Astro 7 + Starlight)

- Follow [`docs/conventions/component-anatomy.md`](../../docs/conventions/component-anatomy.md): exact file names and section order. `tools/test/structure.test.mjs` checks every implemented component.
- Every English page in `src/content/docs/` has a Spanish twin in `src/content/docs/es/` (a test checks
  it). Write natural text for each language; do not machine-translate code.
- Component pages (anatomy order): `<StatusBadge>` + introduction, `## Playground` (`<Playground>`),
  variants, states, accessibility, `## API` (`<ApiTable>`), events by platform (`<EventsTable>`).
- `Playground`, `ApiTable`, `EventsTable` and `StatusBadge` read the contract and the inventory: never
  duplicate API tables or per-platform code by hand. Snippets come from `src/lib/codegen.ts`.
- Previews follow the Cosmos theme picked in the header and the site mode; use `data-fixed` /
  `data-fixed-mode` only for galleries that must show a specific theme or mode.
- Examples use neutral data (`example.com`, fictional names).
- Client scripts never use `innerHTML`; update text with `textContent`.
- Validate with `npx turbo run typecheck test build --filter=@joralvmel/cosmos-docs`.
