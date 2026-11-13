import type { IconDefinition } from '../index.js';

export const squareStop = {
  name: 'square-stop',
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
      'rect',
      {
        x: '9',
        y: '9',
        width: '6',
        height: '6',
        rx: '1',
      },
    ],
  ],
} as const satisfies IconDefinition;
