import type { IconDefinition } from '../index.js';

export const squareCode = {
  name: 'square-code',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm10 9-3 3 3 3',
      },
    ],
    [
      'path',
      {
        d: 'm14 15 3-3-3-3',
      },
    ],
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
  ],
} as const satisfies IconDefinition;
