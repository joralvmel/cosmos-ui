import type { IconDefinition } from '../index.js';

export const moveDiagonal = {
  name: 'move-diagonal',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M11 19H5v-6',
      },
    ],
    [
      'path',
      {
        d: 'M13 5h6v6',
      },
    ],
    [
      'path',
      {
        d: 'M19 5 5 19',
      },
    ],
  ],
} as const satisfies IconDefinition;
