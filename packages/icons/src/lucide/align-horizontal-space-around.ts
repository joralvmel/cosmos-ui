import type { IconDefinition } from '../index.js';

export const alignHorizontalSpaceAround = {
  name: 'align-horizontal-space-around',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'rect',
      {
        width: '6',
        height: '10',
        x: '9',
        y: '7',
        rx: '2',
      },
    ],
    [
      'path',
      {
        d: 'M4 22V2',
      },
    ],
    [
      'path',
      {
        d: 'M20 22V2',
      },
    ],
  ],
} as const satisfies IconDefinition;
