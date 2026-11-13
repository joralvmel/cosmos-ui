import type { IconDefinition } from '../index.js';

export const grid2x2 = {
  name: 'grid-2x2',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 3v18',
      },
    ],
    [
      'path',
      {
        d: 'M3 12h18',
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
