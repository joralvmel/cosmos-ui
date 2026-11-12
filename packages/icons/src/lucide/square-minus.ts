import type { IconDefinition } from '../index.js';

export const squareMinus = {
  name: 'square-minus',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '18',
        height: '18',
        x: '3',
        y: '3',
        rx: '2',
      },
    ],
    [
      'path',
      {
        d: 'M8 12h8',
      },
    ],
  ],
} as const satisfies IconDefinition;
