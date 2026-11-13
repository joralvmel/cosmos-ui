import type { IconDefinition } from '../index.js';

export const circleLetterQ = {
  name: 'circle-letter-q',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'circle',
      {
        cx: '12',
        cy: '12',
        r: '4',
      },
    ],
    [
      'path',
      {
        d: 'm16 16-2.5-2.5',
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
