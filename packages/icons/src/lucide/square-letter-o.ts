import type { IconDefinition } from '../index.js';

export const squareLetterO = {
  name: 'square-letter-o',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '4',
      },
    ],
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
  ],
} as const satisfies IconDefinition;
