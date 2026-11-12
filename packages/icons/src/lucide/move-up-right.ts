import type { IconDefinition } from '../index.js';

export const moveUpRight = {
  name: 'move-up-right',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M13 5H19V11',
      },
    ],
    [
      'path',
      {
        d: 'M19 5L5 19',
      },
    ],
  ],
} as const satisfies IconDefinition;
