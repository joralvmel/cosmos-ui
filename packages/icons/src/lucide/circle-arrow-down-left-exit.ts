import type { IconDefinition } from '../index.js';

export const circleArrowDownLeftExit = {
  name: 'circle-arrow-down-left-exit',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M2 12a10 10 0 1 1 10 10',
      },
    ],
    [
      'path',
      {
        d: 'm2 22 10-10',
      },
    ],
    [
      'path',
      {
        d: 'M8 22H2v-6',
      },
    ],
  ],
} as const satisfies IconDefinition;
