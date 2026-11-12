import type { IconDefinition } from '../index.js';

export const circleArrowUpRightExit = {
  name: 'circle-arrow-up-right-exit',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M22 12A10 10 0 1 1 12 2',
      },
    ],
    [
      'path',
      {
        d: 'M22 2 12 12',
      },
    ],
    [
      'path',
      {
        d: 'M16 2h6v6',
      },
    ],
  ],
} as const satisfies IconDefinition;
