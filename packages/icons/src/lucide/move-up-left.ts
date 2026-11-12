import type { IconDefinition } from '../index.js';

export const moveUpLeft = {
  name: 'move-up-left',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M5 11V5H11',
      },
    ],
    [
      'path',
      {
        d: 'M5 5L19 19',
      },
    ],
  ],
} as const satisfies IconDefinition;
