import type { IconDefinition } from '../index.js';

export const squarePower = {
  name: 'square-power',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 7v4',
      },
    ],
    [
      'path',
      {
        d: 'M7.998 9.003a5 5 0 1 0 8-.005',
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
