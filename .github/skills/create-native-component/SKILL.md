---
name: create-native-component
description: 'Creates a React Native component on a contract, core logic and tokens, with shared scenarios, drift test, demo screen and docs, following the component anatomy.'
---

# create-native-component

Main agent: `native-expert`. Read `AGENTS.md` first.

## Inputs

- Component name
- Whether a web version exists (otherwise use the `native` generator target)

## Steps

Follow the [component workflow](../../../docs/conventions/component-workflow.md). Native-only
components need the same research, questions and scope approval before generation. When completing
an accepted cross-platform component, reuse its decisions; ask again only if native constraints
require a scope/API/design change.

1. Run `component-status`: the entry must exist (native-only entries use `platforms: ['native']`) and its dependencies must be stable.
2. Native-only: `npm run generate -- native <name>`; otherwise complete the native files created by the component generator.
3. Derive props from `ContractProps<typeof contract, 'native'>` and keep `<name>PropNames` in sync; keep the anatomy order (types, prop names, helpers, component).
4. Use `useTheme()` for colors, spacing, radius and typography; add roles, states, labels and 44pt touch targets.
5. Run the shared scenarios with the React Native mock (`packages/native/test/react-native.mock.tsx`); extend the mock for new primitives.
6. Finish the demo screen in `apps/native-demo/app/<name>.tsx` (listed in `src/screens.ts`) and the docs pages.
7. Finish with the structure test (`tools/test/structure.test.mjs`) and `npx turbo run typecheck test build --filter=...@joralvmel/cosmos-native`.
8. Exercise the demo controls and inspect console/accessibility props on React Native Web. Report
   Android/iOS export/build separately from runtime checks on a named emulator/device. Mocks and web
   do not prove touch, TalkBack or VoiceOver behavior; record unavailable checks, never a false pass.
9. Hand evidence to `finish-work` for the local commit and user review pause. Do not push or create
   a PR independently.

## Files

- `packages/native/src/components/<name>.tsx`
- `packages/native/test/<name>.test.tsx`
- `apps/native-demo/app/<name>.tsx`
- docs pages

## Checklist

- [ ] Scenarios + drift green
- [ ] Structure test green
- [ ] Demo typechecks
- [ ] Works in every theme and mode

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
