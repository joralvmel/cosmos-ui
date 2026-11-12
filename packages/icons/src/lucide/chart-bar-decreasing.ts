import type { IconDefinition } from '../index.js';

export const chartBarDecreasing = {
  name: 'chart-bar-decreasing',
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
        d: 'M7 11h8',
      },
    ],
    [
      'path',
      {
        d: 'M7 16h3',
      },
    ],
    [
      'path',
      {
        d: 'M7 6h12',
      },
    ],
  ],
} as const satisfies IconDefinition;
