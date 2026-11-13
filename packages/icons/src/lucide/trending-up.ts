import type { IconDefinition } from '../index.js';

export const trendingUp = {
  name: 'trending-up',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M16 7h6v6',
      },
    ],
    [
      'path',
      {
        d: 'm22 7-8.5 8.5-5-5L2 17',
      },
    ],
  ],
} as const satisfies IconDefinition;
