import type { IconDefinition } from '../index.js';

export const chartLine = {
  name: 'chart-line',
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
        d: 'm19 9-5 5-4-4-3 3',
      },
    ],
  ],
} as const satisfies IconDefinition;
