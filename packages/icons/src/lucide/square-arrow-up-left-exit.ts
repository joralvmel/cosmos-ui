import type { IconDefinition } from '../index.js';

export const squareArrowUpLeftExit = {
  name: 'square-arrow-up-left-exit',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M13 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6',
      },
    ],
    [
      'path',
      {
        d: 'm3 3 9 9',
      },
    ],
    [
      'path',
      {
        d: 'M3 9V3h6',
      },
    ],
  ],
} as const satisfies IconDefinition;
