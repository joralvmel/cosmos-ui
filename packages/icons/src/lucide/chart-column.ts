import type { IconDefinition } from '../index.js';

export const chartColumn = {
  name: 'chart-column',
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
        d: 'M18 17V9',
      },
    ],
    [
      'path',
      {
        d: 'M13 17V5',
      },
    ],
    [
      'path',
      {
        d: 'M8 17v-3',
      },
    ],
  ],
} as const satisfies IconDefinition;
