import type { IconDefinition } from '../index.js';

export const circleLetterN = {
  name: 'circle-letter-n',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M9 16V8.576a.496.496 0 01.937-.243l4.126 7.43A.496.496 0 0015 15.52V8',
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
