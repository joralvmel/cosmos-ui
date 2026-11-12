import type { IconDefinition } from '../index.js';

export const marginRight = {
  name: 'margin-right',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        x: '9',
        y: '9',
        width: '6',
        height: '6',
        rx: '1',
      },
    ],
    [
      'path',
      {
        d: 'M21 3v18',
      },
    ],
  ],
} as const satisfies IconDefinition;
