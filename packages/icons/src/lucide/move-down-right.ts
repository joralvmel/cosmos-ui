import type { IconDefinition } from '../index.js';

export const moveDownRight = {
  name: 'move-down-right',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M19 13V19H13',
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
