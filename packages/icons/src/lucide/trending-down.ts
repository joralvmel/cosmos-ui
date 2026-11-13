import type { IconDefinition } from '../index.js';

export const trendingDown = {
  name: 'trending-down',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M16 17h6v-6',
      },
    ],
    [
      'path',
      {
        d: 'm22 17-8.5-8.5-5 5L2 7',
      },
    ],
  ],
} as const satisfies IconDefinition;
