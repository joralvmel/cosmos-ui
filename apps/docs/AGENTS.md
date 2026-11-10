# AGENTS.md — docs site

Read the root [AGENTS.md](../../AGENTS.md) and `.github/instructions/docs.instructions.md`.

- Pages live in `src/content/docs/` (English) and `src/content/docs/es/` (Spanish); a test checks both exist.
- Components: `Preview`, `Playground` and `ApiTable` read contracts from core; `ThemeSelect` picks the
  Cosmos theme of previews and follows the site light/dark mode; `ThemeGallery` renders every theme.
- `scripts/publish-ai.mjs` copies `llms.txt` and `packages/*/llms.md` into the build.
- Validate with `npx turbo run typecheck test build --filter=@joralvmel/cosmos-docs`.
