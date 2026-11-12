import type { IconDefinition } from '../index.js';

export const grid3x2 = {
  name: 'grid-3x2',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M15 3v18',
      },
    ],
    [
      'path',
      {
        d: 'M3 12h18',
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
