import type { IconDefinition } from '../index.js';

export const moveVertical = {
  name: 'move-vertical',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 2v20',
      },
    ],
    [
      'path',
      {
        d: 'm8 18 4 4 4-4',
      },
    ],
    [
      'path',
      {
        d: 'm8 6 4-4 4 4',
      },
    ],
  ],
} as const satisfies IconDefinition;
