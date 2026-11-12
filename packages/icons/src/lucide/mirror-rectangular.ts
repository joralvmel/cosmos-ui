import type { IconDefinition } from '../index.js';

export const mirrorRectangular = {
  name: 'mirror-rectangular',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M11 6 8 9',
      },
    ],
    [
      'path',
      {
        d: 'm16 7-8 8',
      },
    ],
    [
      'rect',
      {
        x: '4',
        y: '2',
        width: '16',
        height: '20',
        rx: '2',
      },
    ],
  ],
} as const satisfies IconDefinition;
