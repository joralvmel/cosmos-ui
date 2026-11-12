import type { IconDefinition } from '../index.js';

export const moveDiagonal2 = {
  name: 'move-diagonal-2',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M19 13v6h-6',
      },
    ],
    [
      'path',
      {
        d: 'M5 11V5h6',
      },
    ],
    [
      'path',
      {
        d: 'm5 5 14 14',
      },
    ],
  ],
} as const satisfies IconDefinition;
