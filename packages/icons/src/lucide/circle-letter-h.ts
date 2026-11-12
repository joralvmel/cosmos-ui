import type { IconDefinition } from '../index.js';

export const circleLetterH = {
  name: 'circle-letter-h',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M9 16V8',
      },
    ],
    [
      'path',
      {
        d: 'M15 16V8',
      },
    ],
    [
      'path',
      {
        d: 'M9 12h6',
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
