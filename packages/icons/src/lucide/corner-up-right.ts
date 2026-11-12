import type { IconDefinition } from '../index.js';

export const cornerUpRight = {
  name: 'corner-up-right',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm15 14 5-5-5-5',
      },
    ],
    [
      'path',
      {
        d: 'M4 20v-7a4 4 0 0 1 4-4h12',
      },
    ],
  ],
} as const satisfies IconDefinition;
