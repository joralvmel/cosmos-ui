import type { IconDefinition } from '../index.js';

export const squarePaddingHorizontal = {
  name: 'square-padding-horizontal',
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
    [
      'path',
      {
        d: 'M7 16V8',
      },
    ],
  ],
} as const satisfies IconDefinition;
