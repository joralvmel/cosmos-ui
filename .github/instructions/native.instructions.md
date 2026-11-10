---
applyTo: 'packages/native/**,packages/charts-native/**,apps/native-demo/**'
---

# React Native (0.88, Expo SDK 58)

- Components are written for React Native (no Web Components, no DOM). Props derive from the contract
  (`ContractProps<typeof contract, 'native'>`) and a `<name>PropNames` array is checked by the drift
  test.
- Callbacks receive the contract `detail` (`onPress({ source })`).
- Read every visual value from `useTheme()` (`@joralvmel/cosmos-tokens/native`); no literal colors.
- Accessibility: `accessibilityRole`, `accessibilityState`, `accessibilityLabel`; touch targets of at
  least 44pt (use `hitSlop` for compact sizes); respect reduced motion.
- New dependencies (gesture handler, reanimated, svg) only when needed and with their license noted.
- Tests run in Vitest with the DOM stand-ins in `packages/native/test/react-native.mock.tsx`; extend
  the mock when a new primitive is used. Device checks happen in `apps/native-demo`.
- Every component has a screen in `apps/native-demo/app/<name>.tsx` listed in `src/screens.ts`.
