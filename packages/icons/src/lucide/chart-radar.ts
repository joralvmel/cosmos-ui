import type { IconDefinition } from '../index.js';

export const chartRadar = {
  name: 'chart-radar',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 2v10',
      },
    ],
    [
      'path',
      {
        d: 'm16 18 3.085-8.125L12 4.103 3.473 9.442l3.196 10.554z',
      },
    ],
    [
      'path',
      {
        d: 'm2 9 10 3 6 9',
      },
    ],
    [
      'path',
      {
        d: 'm6 21 6-9 10-3',
      },
    ],
  ],
} as const satisfies IconDefinition;
