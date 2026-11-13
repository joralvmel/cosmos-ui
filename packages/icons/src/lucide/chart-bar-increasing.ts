import type { IconDefinition } from '../index.js';

export const chartBarIncreasing = {
  name: 'chart-bar-increasing',
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
        d: 'M7 16h12',
      },
    ],
    [
      'path',
      {
        d: 'M7 6h3',
      },
    ],
  ],
} as const satisfies IconDefinition;
