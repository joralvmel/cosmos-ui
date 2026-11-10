# ADR 0004: Theming model

- Status: accepted
- Date: 2026-11-10

## Context

Cosmos must offer several themes (palette families), each with light and dark modes, on the web and in
React Native, and let consumers create their own. Hand-picked palettes do not scale and often fail
contrast in one of the modes.

## Decision

- Model: `theme × mode (light | dark | system) × contrast (normal, high later)`.
- Themes are declared with `defineTheme({ name, seeds, harmony, neutral, radius, modes })`. Inputs are
  validated (name format, reserved mode names, known tokens only, no prototype keys, valid colors).
- Generation works in **OKLCH**: 12-step scales with a lightness curve per mode (dark mode is not an
  inversion), chroma reduced in dark mode, accent derived from the harmony, status hues nudged towards
  the primary hue by at most 3°, an 8-color chart palette with alternating lightness.
- Semantic tokens are shared by every theme: `bg`, `surface`, `surface-raised`, `fg`, `fg-muted`,
  `border`, `border-strong`, `primary*`, `accent*`, `success|warning|danger|info` (`-fg`, `-subtle`,
  `-text`), `focus-ring`, `overlay`, `chart-1..8`.
- Validation (`validateTheme`) is part of the build: WCAG 2.2 AA is normative (4.5:1 text, 3:1 UI and
  focus), APCA is informative, and status/chart pairs must stay distinguishable (CIEDE2000 ≥ 10) under
  simulated protanopia, deuteranopia and tritanopia. A failing theme breaks the build.
- Warning is a light fill with dark text in both modes; its non-text contrast is carried by
  `warning-text`.
- Web usage: `data-theme` and `data-mode` on the same element; `system` follows `prefers-color-scheme`;
  without `data-mode` the light mode applies; the first theme is the default. Runtime helpers live in
  `@joralvmel/cosmos-tokens/runtime` with an anti-flicker init script.
- React Native: `CosmosThemeProvider` with `theme` and `mode` (`system` uses `useColorScheme`).

## Consequences

- Initial themes: `cosmos` (default) and `nebula`; `aurora`, `eclipse` and `terra` are planned.
- Theme names cannot be `light`, `dark` or `system`.
