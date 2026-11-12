import type { IconDefinition } from '../index.js';

export const moveRight = {
  name: 'move-right',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M18 8L22 12L18 16',
      },
    ],
    [
      'path',
      {
        d: 'M2 12H22',
      },
    ],
  ],
} as const satisfies IconDefinition;
