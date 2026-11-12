import type { IconDefinition } from '../index.js';

export const squarePadding = {
  name: 'square-padding',
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
        d: 'M14 17h-4',
      },
    ],
    [
      'path',
      {
        d: 'M14 7h-4',
      },
    ],
    [
      'path',
      {
        d: 'M17 14v-4',
      },
    ],
    [
      'path',
      {
        d: 'M7 14v-4',
      },
    ],
  ],
} as const satisfies IconDefinition;
