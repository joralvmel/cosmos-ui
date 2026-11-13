import type { IconDefinition } from '../index.js';

export const chartNoAxesColumn = {
  name: 'chart-no-axes-column',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M5 21v-6',
      },
    ],
    [
      'path',
      {
        d: 'M12 21V3',
      },
    ],
    [
      'path',
      {
        d: 'M19 21V9',
      },
    ],
  ],
} as const satisfies IconDefinition;
