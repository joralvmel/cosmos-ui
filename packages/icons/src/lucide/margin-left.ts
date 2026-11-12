import type { IconDefinition } from '../index.js';

export const marginLeft = {
  name: 'margin-left',
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
        d: 'M3 3v18',
      },
    ],
  ],
} as const satisfies IconDefinition;
