import type { IconDefinition } from '../index.js';

export const cylinder = {
  name: 'cylinder',
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
        d: 'M3 5v14a9 3 0 0 0 18 0V5',
      },
    ],
  ],
} as const satisfies IconDefinition;
