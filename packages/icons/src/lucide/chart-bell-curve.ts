import type { IconDefinition } from '../index.js';

export const chartBellCurve = {
  name: 'chart-bell-curve',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M3 3v16a2 2 0 0 0 2 2h16',
      },
    ],
    [
      'path',
      {
        d: 'M7 16c3.5 0 2.5-10 6-10s2.5 10 6 10',
      },
    ],
  ],
} as const satisfies IconDefinition;
