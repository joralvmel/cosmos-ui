import type { IconDefinition } from '../index.js';

export const copyCheck = {
  name: 'copy-check',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'm12 15 2 2 4-4',
      },
    ],
    [
      'rect',
      {
        width: '14',
        height: '14',
        x: '8',
        y: '8',
        rx: '2',
        ry: '2',
      },
    ],
    [
      'path',
      {
        d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2',
      },
    ],
  ],
} as const satisfies IconDefinition;
