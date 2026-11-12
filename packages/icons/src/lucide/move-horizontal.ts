import type { IconDefinition } from '../index.js';

export const moveHorizontal = {
  name: 'move-horizontal',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm18 8 4 4-4 4',
      },
    ],
    [
      'path',
      {
        d: 'M2 12h20',
      },
    ],
    [
      'path',
      {
        d: 'm6 8-4 4 4 4',
      },
    ],
  ],
} as const satisfies IconDefinition;
