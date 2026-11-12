import type { IconDefinition } from '../index.js';

export const userRound = {
  name: 'user-round',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '12',
        cy: '8',
        r: '5',
      },
    ],
    [
      'path',
      {
        d: 'M20 21a8 8 0 0 0-16 0',
      },
    ],
  ],
} as const satisfies IconDefinition;
