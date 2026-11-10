# AGENTS.md — @joralvmel/cosmos-core

Read the root [AGENTS.md](../../AGENTS.md) first.

- Contracts live in `src/specs/<name>.ts` (created by the generator) and are registered in `contracts` in `src/index.ts`.
- Scenarios (`src/specs/<name>.scenarios.ts`) describe behavior for every platform; keep them deterministic and platform-filtered.
- Headless helpers in `src/headless/` are pure TypeScript: no DOM, no React, no timers without injection.
- Target coverage: 90 % or more.

Validate with `npx turbo run typecheck test build --filter=...@joralvmel/cosmos-core`.
