import type { IconDefinition } from '../index.js';

export const circleLetterS = {
  name: 'circle-letter-s',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M14.5 8H11a2 2 0 100 4h2a2 2 0 110 4H9',
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
