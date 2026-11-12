import type { IconDefinition } from '../index.js';

export const cornerUpLeft = {
  name: 'corner-up-left',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M20 20v-7a4 4 0 0 0-4-4H4',
      },
    ],
    [
      'path',
      {
        d: 'M9 14 4 9l5-5',
      },
    ],
  ],
} as const satisfies IconDefinition;
