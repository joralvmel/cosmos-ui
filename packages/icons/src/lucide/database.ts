import type { IconDefinition } from '../index.js';

export const database = {
  name: 'database',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'ellipse',
      {
        cx: '12',
        cy: '5',
        rx: '9',
        ry: '3',
      },
    ],
    [
      'path',
      {
        d: 'M3 5V19A9 3 0 0 0 21 19V5',
      },
    ],
    [
      'path',
      {
        d: 'M3 12A9 3 0 0 0 21 12',
      },
    ],
  ],
} as const satisfies IconDefinition;
