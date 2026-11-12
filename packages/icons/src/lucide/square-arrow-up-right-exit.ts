import type { IconDefinition } from '../index.js';

export const squareArrowUpRightExit = {
  name: 'square-arrow-up-right-exit',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6',
      },
    ],
    [
      'path',
      {
        d: 'm21 3-9 9',
      },
    ],
    [
      'path',
      {
        d: 'M15 3h6v6',
      },
    ],
  ],
} as const satisfies IconDefinition;
