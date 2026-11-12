import type { IconDefinition } from '../index.js';

export const squareSquare = {
  name: 'square-square',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        x: '3',
        y: '3',
        width: '18',
        height: '18',
        rx: '2',
      },
    ],
    [
      'rect',
      {
        x: '8',
        y: '8',
        width: '8',
        height: '8',
        rx: '1',
      },
    ],
  ],
} as const satisfies IconDefinition;
