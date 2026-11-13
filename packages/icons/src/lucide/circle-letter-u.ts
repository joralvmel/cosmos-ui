import type { IconDefinition } from '../index.js';

export const circleLetterU = {
  name: 'circle-letter-u',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M15 8v5a3 3 0 1 1-6 0V8',
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
