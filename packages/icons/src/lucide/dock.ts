import type { IconDefinition } from '../index.js';

export const dock = {
  name: 'dock',
  viewBox: '0 0 24 24',
  nodes: [
    [
      'path',
      {
        d: 'M2 8h20',
      },
    ],
    [
      'rect',
      {
        width: '20',
        height: '16',
        x: '2',
        y: '4',
        rx: '2',
      },
    ],
    [
      'path',
      {
        d: 'M6 16h12',
      },
    ],
  ],
} as const satisfies IconDefinition;
