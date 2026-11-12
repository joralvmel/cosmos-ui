import type { IconDefinition } from '../index.js';

export const squareLetterT = {
  name: 'square-letter-t',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M12 16V8',
      },
    ],
    [
      'path',
      {
        d: 'M9 8h6',
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
