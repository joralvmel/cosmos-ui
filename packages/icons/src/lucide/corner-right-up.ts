import type { IconDefinition } from '../index.js';

export const cornerRightUp = {
  name: 'corner-right-up',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm10 9 5-5 5 5',
      },
    ],
    [
      'path',
      {
        d: 'M4 20h7a4 4 0 0 0 4-4V4',
      },
    ],
  ],
} as const satisfies IconDefinition;
