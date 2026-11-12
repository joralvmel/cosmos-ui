import type { IconDefinition } from '../index.js';

export const spline = {
  name: 'spline',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '19',
        cy: '5',
        r: '2',
      },
    ],
    [
      'circle',
      {
        cx: '5',
        cy: '19',
        r: '2',
      },
    ],
    [
      'path',
      {
        d: 'M5 17A12 12 0 0 1 17 5',
      },
    ],
  ],
} as const satisfies IconDefinition;
