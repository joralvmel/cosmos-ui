import type { IconDefinition } from '../index.js';

export const squareArrowLeft = {
  name: 'square-arrow-left',
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
        d: 'm12 8-4 4 4 4',
      },
    ],
    [
      'path',
      {
        d: 'M16 12H8',
      },
    ],
  ],
} as const satisfies IconDefinition;
