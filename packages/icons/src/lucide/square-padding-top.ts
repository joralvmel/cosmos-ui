import type { IconDefinition } from '../index.js';

export const squarePaddingTop = {
  name: 'square-padding-top',
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
      'path',
      {
        d: 'M8 7h8',
      },
    ],
  ],
} as const satisfies IconDefinition;
