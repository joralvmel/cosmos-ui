import type { IconDefinition } from '../index.js';

export const circleLetterJ = {
  name: 'circle-letter-j',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M14 8v5.5a1 1 0 01-5 0V13',
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
