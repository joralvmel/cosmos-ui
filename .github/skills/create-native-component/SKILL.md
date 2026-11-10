---
name: create-native-component
description: 'Creates a React Native component on a contract, core logic and tokens, with shared scenarios, drift test and a screen in the Expo demo.'
---

# create-native-component

Main agent: `native-expert`. Read `AGENTS.md` first.

## Inputs

- Component name
- Whether a web version exists (otherwise use the `native` generator target)

## Steps

1. For native-only components run `npm run generate -- native <name>`; otherwise complete the native files created by the component generator.
2. Derive props from `ContractProps<typeof contract, 'native'>` and keep `<name>PropNames` in sync.
3. Use `useTheme()` for colors, spacing, radius and typography.
4. Add roles, states, labels and 44pt touch targets.
5. Run the shared scenarios with the React Native mock; extend the mock for new primitives.
6. Add/finish the demo screen in `apps/native-demo/app/<name>.tsx` and `src/screens.ts`.

## Files

- `packages/native/src/components/<name>.tsx`
- `packages/native/test/<name>.test.tsx`
- `apps/native-demo/app/<name>.tsx`

## Checklist

- [ ] Scenarios + drift green
- [ ] Demo typechecks
- [ ] Works in every theme and mode

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
