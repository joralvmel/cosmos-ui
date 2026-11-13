import type { IconDefinition } from '../index.js';

export const squareLetterH = {
  name: 'square-letter-h',
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
      'rect',
      {
        width: '18',
        height: '18',
        x: '3',
        y: '3',
        rx: '2',
      },
    ],
  ],
} as const satisfies IconDefinition;
