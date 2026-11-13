import type { IconDefinition } from '../index.js';

export const circleLetterL = {
  name: 'circle-letter-l',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M9 8v7.5a.5.5 0 0 0 .5.5H15',
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
