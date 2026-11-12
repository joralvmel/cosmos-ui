import type { IconDefinition } from '../index.js';

export const moveUp = {
  name: 'move-up',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M8 6L12 2L16 6',
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
