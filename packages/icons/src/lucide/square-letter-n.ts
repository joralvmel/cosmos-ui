import type { IconDefinition } from '../index.js';

export const squareLetterN = {
  name: 'square-letter-n',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M9 16V8.576a.496.496 0 01.937-.243l4.126 7.43A.496.496 0 0015 15.52V8',
      },
    ],
    [
      'rect',
      {
        x: '3',
        y: '3',
        width: '18',
        height: '18',
        rx: '2',
      },
    ],
  ],
} as const satisfies IconDefinition;
