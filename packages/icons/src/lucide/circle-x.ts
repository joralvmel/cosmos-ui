import type { IconDefinition } from '../index.js';

export const circleX = {
  name: 'circle-x',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '10',
      },
    ],
    [
      'path',
      {
        d: 'm15 9-6 6',
      },
    ],
    [
      'path',
      {
        d: 'm9 9 6 6',
      },
    ],
  ],
} as const satisfies IconDefinition;
