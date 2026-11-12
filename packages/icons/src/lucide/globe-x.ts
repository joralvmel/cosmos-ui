import type { IconDefinition } from '../index.js';

export const globeX = {
  name: 'globe-x',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm16 3 5 5',
      },
    ],
    [
      'path',
      {
        d: 'M2 12h20A10 10 0 1 1 12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 4-10',
      },
    ],
    [
      'path',
      {
        d: 'm21 3-5 5',
      },
    ],
  ],
} as const satisfies IconDefinition;
