export const layout = n => `import { linearScale, ticks } from './index.js';

export interface ${n.pascal}Datum {
  label: string;
  value: number;
}

export interface ${n.pascal}Layout {
  width: number;
  height: number;
  ticks: number[];
  // TODO(generator) describe the geometry of the chart (bars, points, arcs...).
  points: { label: string; x: number; y: number }[];
}

/** Pure layout of the ${n.title}: data in, geometry out (no DOM). */
export function ${n.camel}Layout(
  data: readonly ${n.pascal}Datum[],
  size: { width: number; height: number }
): ${n.pascal}Layout {
  const max = Math.max(0, ...data.map(datum => datum.value));
  const y = linearScale([0, max || 1], [size.height, 0]);
  const step = data.length > 1 ? size.width / (data.length - 1) : 0;
  return {
    ...size,
    ticks: ticks(0, max || 1),
    points: data.map((datum, index) => ({ label: datum.label, x: index * step, y: y(datum.value) })),
  };
}
`;

export const layoutTest = n => `import { describe, expect, it } from 'vitest';
import { ${n.camel}Layout } from '../src/${n.kebab}-layout.js';

describe('${n.camel}Layout', () => {
  it('maps values into the drawing area', () => {
    const layout = ${n.camel}Layout(
      [
        { label: 'a', value: 0 },
        { label: 'b', value: 10 },
      ],
      { width: 100, height: 50 }
    );
    expect(layout.points).toEqual([
      { label: 'a', x: 0, y: 50 },
      { label: 'b', x: 100, y: 0 },
    ]);
  });
});
`;

export const layoutExport = n =>
  `export { type ${n.pascal}Datum, type ${n.pascal}Layout, ${n.camel}Layout } from './${n.kebab}-layout.js';\n`;

export const changeset = n => `---
'@joralvmel/cosmos-charts-core': minor
---

Add the ${n.title} layout.
`;
