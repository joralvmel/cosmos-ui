import type { IconDefinition } from '../index.js';

export const squareArrowRightExit = {
  name: 'square-arrow-right-exit',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M11 12h10',
      },
    ],
    [
      'path',
      {
        d: 'm17 16 4-4-4-4',
      },
    ],
    [
      'path',
      {
        d: 'M21 6.33V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-1.33',
      },
    ],
  ],
} as const satisfies IconDefinition;
