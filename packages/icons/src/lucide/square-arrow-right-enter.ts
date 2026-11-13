import type { IconDefinition } from '../index.js';

export const squareArrowRightEnter = {
  name: 'square-arrow-right-enter',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M3 12h10',
      },
    ],
    [
      'path',
      {
        d: 'M3 8V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2v-3',
      },
    ],
    [
      'path',
      {
        d: 'm9 16 4-4-4-4',
      },
    ],
  ],
} as const satisfies IconDefinition;
