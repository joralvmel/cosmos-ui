import type { IconDefinition } from '../index.js';

export const laptopMinimalCheck = {
  name: 'laptop-minimal-check',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M2 20h20',
      },
    ],
    [
      'path',
      {
        d: 'm9 10 2 2 4-4',
      },
    ],
    [
      'rect',
      {
        x: '3',
        y: '4',
        width: '18',
        height: '12',
        rx: '2',
      },
    ],
  ],
} as const satisfies IconDefinition;
