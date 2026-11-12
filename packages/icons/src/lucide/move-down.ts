import type { IconDefinition } from '../index.js';

export const moveDown = {
  name: 'move-down',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M8 18L12 22L16 18',
      },
    ],
    [
      'path',
      {
        d: 'M12 2V22',
      },
    ],
  ],
} as const satisfies IconDefinition;
