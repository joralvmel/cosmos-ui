import type { IconDefinition } from '../index.js';

export const mars = {
  name: 'mars',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M16 3h5v5',
      },
    ],
    [
      'path',
      {
        d: 'm21 3-6.75 6.75',
      },
    ],
    [
      'circle',
      {
        cx: '10',
        cy: '14',
        r: '6',
      },
    ],
  ],
} as const satisfies IconDefinition;
