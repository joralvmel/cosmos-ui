import type { IconDefinition } from '../index.js';

export const squareText = {
  name: 'square-text',
  viewBox: '0 0 24 24',
  nodes: [
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
    [
      'path',
      {
        d: 'M7 8h8',
      },
    ],
    [
      'path',
      {
        d: 'M7 12h10',
      },
    ],
    [
      'path',
      {
        d: 'M7 16h6',
      },
    ],
  ],
} as const satisfies IconDefinition;
