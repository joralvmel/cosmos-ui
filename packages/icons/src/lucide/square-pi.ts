import type { IconDefinition } from '../index.js';

export const squarePi = {
  name: 'square-pi',
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
        d: 'M7 7h10',
      },
    ],
    [
      'path',
      {
        d: 'M10 7v10',
      },
    ],
    [
      'path',
      {
        d: 'M16 17a2 2 0 0 1-2-2V7',
      },
    ],
  ],
} as const satisfies IconDefinition;
