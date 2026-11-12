import type { IconDefinition } from '../index.js';

export const userRoundCheck = {
  name: 'user-round-check',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M2 21a8 8 0 0 1 13.292-6',
      },
    ],
    [
      'circle',
      {
        cx: '10',
        cy: '8',
        r: '5',
      },
    ],
    [
      'path',
      {
        d: 'm16 19 2 2 4-4',
      },
    ],
  ],
} as const satisfies IconDefinition;
