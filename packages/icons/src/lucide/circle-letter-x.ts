import type { IconDefinition } from '../index.js';

export const circleLetterX = {
  name: 'circle-letter-x',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm9 16 6-8',
      },
    ],
    [
      'path',
      {
        d: 'm9 8 6 8',
      },
    ],
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '10',
      },
    ],
  ],
} as const satisfies IconDefinition;
