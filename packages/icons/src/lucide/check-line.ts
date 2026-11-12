import type { IconDefinition } from '../index.js';

export const checkLine = {
  name: 'check-line',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M20 4L9 15',
      },
    ],
    [
      'path',
      {
        d: 'M21 19L3 19',
      },
    ],
    [
      'path',
      {
        d: 'M9 15L4 10',
      },
    ],
  ],
} as const satisfies IconDefinition;
