---
name: create-chart
description: 'Creates a chart: pure layout in charts-core, SVG rendering on the web, React Native rendering, accessibility and docs.'
---

# create-chart

Main agent: `chart-builder`. Read `AGENTS.md` first.

## Inputs

- Chart name (e.g. `bar-chart`)
- Data shape and interactions

## Steps

1. Run `npm run generate -- chart <name>`.
2. Implement the layout as a pure function; test geometry, ticks, empty and edge data.
3. Render SVG in `packages/charts` with theme colors and an accessible description/data table.
4. Render in `packages/charts-native` with `react-native-svg` using the same layout.
5. Write docs pages (EN + ES) with examples.

## Files

- `packages/charts-core/src/<name>-layout.ts`
- `packages/charts/src/`
- `packages/charts-native/src/`

## Checklist

- [ ] Layout 100 % tested without DOM
- [ ] Theme colors only
- [ ] Keyboard + data table

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
