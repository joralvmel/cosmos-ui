import type { IconDefinition } from '../index.js';

export const table2 = {
  name: 'table-2',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M3 9h18',
      },
    ],
    [
      'path',
      {
        d: 'M9 3v18',
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
