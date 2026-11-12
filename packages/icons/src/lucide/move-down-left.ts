import type { IconDefinition } from '../index.js';

export const moveDownLeft = {
  name: 'move-down-left',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M11 19H5V13',
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
