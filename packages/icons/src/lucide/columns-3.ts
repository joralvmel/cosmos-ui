import type { IconDefinition } from '../index.js';

export const columns3 = {
  name: 'columns-3',
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
        d: 'M9 3v18',
      },
    ],
    [
      'path',
      {
        d: 'M15 3v18',
      },
    ],
  ],
} as const satisfies IconDefinition;
