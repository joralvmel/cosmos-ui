---
applyTo: 'packages/charts-core/**,packages/charts/**,packages/charts-native/**'
---

# Charts

- Layout is pure and DOM-free in `packages/charts-core/src/<name>-layout.ts`: data + size in, geometry
  out. It is fully unit tested and shared by web and native renderers.
- Web charts render SVG with Lit; native charts render with `react-native-svg`. Both use the same layout.
- Colors come from the theme palette (`seriesColorToken(index)` → `--cosm-chart-1..8` or
  `theme.colors['chart-n']`); never hard-code colors.
- Accessibility: a text description, a data table alternative, keyboard focus on data points and
  tooltips that do not rely on hover only.
- `d3-scale` and `d3-shape` (ISC) are allowed when a layout needs them; record new dependencies.
