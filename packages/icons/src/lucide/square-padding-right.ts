import type { IconDefinition } from '../index.js';

export const squarePaddingRight = {
  name: 'square-padding-right',
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
        d: 'M17 16V8',
      },
    ],
  ],
} as const satisfies IconDefinition;
