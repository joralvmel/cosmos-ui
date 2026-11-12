import type { IconDefinition } from '../index.js';

export const squareLetterI = {
  name: 'square-letter-i',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 16V8',
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
