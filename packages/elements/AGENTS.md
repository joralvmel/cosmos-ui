# AGENTS.md — @joralvmel/cosmos-elements

Read the root [AGENTS.md](../../AGENTS.md) first.

- Follow `.github/instructions/elements.instructions.md`.
- Each component is generated (`npm run generate -- component <name>`) and keeps its subpath export.
- Behavior lives here; wrappers only forward.
- Tests: shared scenarios, contract drift, forms, parts and accessibility attributes.

Validate with `npx turbo run typecheck test build --filter=...@joralvmel/cosmos-elements`.
