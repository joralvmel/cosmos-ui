# AGENTS.md — @joralvmel/cosmos-native

Read the root [AGENTS.md](../../AGENTS.md) first.

- Follow `.github/instructions/native.instructions.md`.
- Props derive from contracts; `<name>PropNames` is checked by the drift test.
- Tests use the DOM stand-ins in `test/react-native.mock.tsx`; device checks happen in `apps/native-demo`.

Validate with `npx turbo run typecheck test build --filter=...@joralvmel/cosmos-native`.
