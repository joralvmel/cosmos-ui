# AGENTS.md — @joralvmel/cosmos-cli

Read the root [AGENTS.md](../../AGENTS.md) first.

- Keep `run()` pure (I/O injected) so commands are testable.
- `init-ai` must be idempotent and only edit marked blocks.

Validate with `npx turbo run typecheck test build --filter=...@joralvmel/cosmos-cli`.
